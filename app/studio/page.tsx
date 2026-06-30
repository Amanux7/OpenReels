'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { SlidersHorizontal, Plus, HelpCircle, Check, CreditCard, Sparkles } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { createClient } from '@/utils/supabase/client';
import { secureFetch } from '@/utils/api';
import { StudioSidebar } from '@/components/studio/studio-sidebar';
import { GenerationCanvas } from '@/components/studio/generation-canvas';
import { GenerationHistory } from '@/components/studio/generation-history';
import { MOCK_GENERATION_HISTORY, MODELS } from '@/lib/constants';
import { Generation, GenerationParams } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [creditBalance, setCreditBalance] = useState(50);
  const [tier, setTier] = useState<'free' | 'pro' | 'max'>('free');
  const [generations, setGenerations] = useState<Generation[]>(MOCK_GENERATION_HISTORY);
  const [activeGen, setActiveGen] = useState<Generation | null>(MOCK_GENERATION_HISTORY[0]);
  const [initialParams, setInitialParams] = useState<Partial<GenerationParams> | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Phase 3 Real-time async generation tracking
  const [pendingGenId, setPendingGenId] = useState<string | null>(null);
  const pendingGenIdRef = useRef<string | null>(null);
  const activeGenRef = useRef<Generation | null>(null);

  useEffect(() => {
    pendingGenIdRef.current = pendingGenId;
  }, [pendingGenId]);

  useEffect(() => {
    activeGenRef.current = activeGen;
  }, [activeGen]);

  // Helper to fetch user profiles for syncing credit balance
  const fetchCredits = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance, tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCreditBalance(profile.credit_balance);
        setTier(profile.tier as 'free' | 'pro' | 'max');
      }
    } catch (err) {
      console.error('Error fetching updated credits:', err);
    }
  };

  // Real-time Event Listener for Supabase Generations table updates
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    console.log("Subscribing to generations changes for user:", user.id);

    const channel = supabase
      .channel('public:generations')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE to keep local generations list fully synced!
          schema: 'public',
          table: 'generations',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('Supabase Realtime event received:', payload);
          const eventType = payload.eventType;

          if (eventType === 'INSERT') {
            const newGen = payload.new as Generation;
            setGenerations(prev => {
              if (prev.some(g => g.id === newGen.id)) return prev;
              return [newGen, ...prev];
            });
          } else if (eventType === 'UPDATE') {
            const updatedGen = payload.new as Generation;

            // Update the generations list
            setGenerations(prev => {
              const index = prev.findIndex(g => g.id === updatedGen.id);
              if (index !== -1) {
                const copy = [...prev];
                copy[index] = { ...copy[index], ...updatedGen };
                return copy;
              }
              return [updatedGen, ...prev];
            });

            // If the updated row matches our active or pending generation
            const isTarget = pendingGenIdRef.current === updatedGen.id || 
                             (activeGenRef.current && activeGenRef.current.id === updatedGen.id);

            if (isTarget) {
              setActiveGen(updatedGen);

              if (updatedGen.status === 'completed') {
                setStatus('completed');
                setProgressPercent(100);
                setProgressText('Video generation complete!');
                setPendingGenId(null);
                fetchCredits(); // Sync credits (deduction verified)
              } else if (updatedGen.status === 'failed') {
                setStatus('failed');
                setProgressText(`Error: ${updatedGen.error_message || 'Model execution failed'}`);
                setPendingGenId(null);
                fetchCredits(); // Sync credits (refunded)
              } else if (updatedGen.status === 'processing') {
                setStatus('processing');
                setProgressPercent(60);
                setProgressText('GPU is rendering cinematic frames...');
              } else if (updatedGen.status === 'pending') {
                setStatus('pending');
                setProgressPercent(30);
                setProgressText('Job queued, waiting for GPU allocation...');
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase Realtime subscription status: ${status}`);
      });

    return () => {
      console.log("Cleaning up Realtime listener...");
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
        } else {
          setUser(user);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('credit_balance, tier')
            .eq('id', user.id)
            .single();

          if (profile) {
            setCreditBalance(profile.credit_balance);
            setTier(profile.tier as 'free' | 'pro' | 'max');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking authentication session:', err);
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);
  
  // Generation simulator states
  const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [progressText, setProgressText] = useState('Initiating...');
  const [progressPercent, setProgressPercent] = useState(0);

  // Billing modal states
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingSuccess, setBillingSuccess] = useState(false);

  // Mobile sidebar sheet control
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Listen to searchParams changes for Remix loading
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const negative_prompt = searchParams.get('negative_prompt');
    const aspect_ratio = searchParams.get('aspect_ratio');
    const model_used = searchParams.get('model');
    const stepsStr = searchParams.get('steps');
    const guidanceStr = searchParams.get('guidance');
    const seedStr = searchParams.get('seed');

    if (prompt || negative_prompt || aspect_ratio || model_used || stepsStr || guidanceStr || seedStr) {
      const params: Partial<GenerationParams> = {};
      if (prompt) params.prompt = prompt;
      if (negative_prompt) params.negative_prompt = negative_prompt;
      if (aspect_ratio) params.aspect_ratio = aspect_ratio;
      if (model_used) params.model_used = model_used;
      if (stepsStr) params.num_inference_steps = parseInt(stepsStr, 10);
      if (guidanceStr) params.guidance_scale = parseFloat(guidanceStr);
      if (seedStr) params.seed = parseInt(seedStr, 10);
      
      setInitialParams(params);
      
      // Auto fill or trigger visual cues if needed
      console.log('Remix params parsed from URL:', params);
    }
  }, [searchParams]);

  // Handle generation start
  const handleGenerate = async (params: GenerationParams, mode: 'image' | 'video') => {
    const model = MODELS.find(m => m.id === params.model_used) || MODELS[0];
    if (creditBalance < model.cost_credits) return;

    // Close mobile sheet if open
    setIsMobileSidebarOpen(false);

    // Start loading state
    setStatus('pending');
    setActiveGen(null);
    setProgressPercent(10);
    setProgressText('Sending request to FastAPI microservice...');

    try {
      let endpoint = '';
      let body: any = {};

      if (mode === 'image') {
        if (params.model_used === 'google-imagen') {
          endpoint = '/api/v1/generate/image/imagen';
          body = {
            prompt: params.prompt,
            aspect_ratio: params.aspect_ratio || '1:1',
          };
        } else {
          endpoint = '/api/v1/generate/image/nanobanana';
          body = {
            prompt: params.prompt,
            reference_image: params.image_reference || null,
            aspect_ratio: params.aspect_ratio || '1:1',
          };
        }
      } else {
        if (params.model_used === 'kling') {
          endpoint = '/api/v1/generate/video/kling';
          body = {
            prompt: params.prompt,
            config: {
              aspect_ratio: params.aspect_ratio || '16:9',
              duration: 5,
            },
          };
        } else {
          endpoint = '/api/v1/generate/video/seedance';
          body = {
            prompt: params.prompt,
            image_reference: params.image_reference || null,
            duration: '5',
          };
        }
      }

      setProgressPercent(30);
      setProgressText('Waiting for response from FastAPI...');

      const response = await secureFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();

      // Deduct credits locally for optimistic UI response
      setCreditBalance(prev => Math.max(0, prev - model.cost_credits));

      if (mode === 'image') {
        setProgressPercent(70);
        setProgressText('Processing generated image...');
        
        setTimeout(() => {
          setProgressPercent(100);
          setProgressText('Image generation complete!');

          const generatedUrl = resData.image_url || '/mock-generations/cyberpunk_city.png';
          
          const newGen: Generation = {
            id: resData.generation_id || `gen-${Date.now()}`,
            user_id: user?.id || 'user-1',
            prompt: params.prompt,
            negative_prompt: params.negative_prompt || '',
            image_url: generatedUrl,
            video_url: null,
            thumbnail_url: generatedUrl,
            model_used: params.model_used,
            generation_type: 'image',
            parameters: params,
            aspect_ratio: params.aspect_ratio,
            seed: params.seed || Math.floor(Math.random() * 9999999999),
            status: 'completed',
            error_message: null,
            credits_used: model.cost_credits,
            is_public: false,
            likes_count: 0,
            remix_count: 0,
            remixed_from: null,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };

          setGenerations(prev => [newGen, ...prev]);
          setActiveGen(newGen);
          setStatus('completed');
          fetchCredits(); // Fetch final verified credits
        }, 800);
      } else {
        // Video Generation: Register pending generation state and await webhook callback via Supabase Realtime
        const genId = resData.task_id;
        
        setPendingGenId(genId);
        
        setProgressPercent(30);
        setProgressText('Request accepted. GPU rendering scheduled...');
        setStatus('pending');

        const pendingGen: Generation = {
          id: genId,
          user_id: user?.id || 'user-1',
          prompt: params.prompt,
          negative_prompt: params.negative_prompt || '',
          image_url: null,
          video_url: null,
          thumbnail_url: null,
          model_used: params.model_used,
          generation_type: 'video',
          parameters: params,
          aspect_ratio: params.aspect_ratio,
          seed: params.seed || null,
          status: 'pending',
          error_message: null,
          credits_used: model.cost_credits,
          is_public: false,
          likes_count: 0,
          remix_count: 0,
          remixed_from: null,
          created_at: new Date().toISOString(),
          completed_at: null
        };

        setActiveGen(pendingGen);
      }
    } catch (err: any) {
      console.error('FastAPI generation request failed:', err);
      setStatus('failed');
      setProgressText(`Error: ${err.message || 'Failed to connect to backend microservice'}`);
      alert(`Generation request failed: ${err.message || err}`);
    }
  };

  const handleSelectGeneration = (gen: Generation) => {
    setActiveGen(gen);
    setStatus('completed');
  };

  const handleRemix = (gen: Generation) => {
    setInitialParams({
      prompt: gen.prompt,
      negative_prompt: gen.negative_prompt,
      aspect_ratio: gen.aspect_ratio,
      model_used: gen.model_used,
      num_inference_steps: gen.parameters.num_inference_steps,
      guidance_scale: gen.parameters.guidance_scale,
      seed: gen.seed || undefined
    });
  };

  const handleTogglePublic = (id: string, currentVal: boolean) => {
    setGenerations(prev => prev.map(g => g.id === id ? { ...g, is_public: !currentVal } : g));
    if (activeGen && activeGen.id === id) {
      setActiveGen(prev => prev ? { ...prev, is_public: !currentVal } : null);
    }
  };

  const handleShare = (gen: Generation) => {
    navigator.clipboard.writeText(gen.prompt);
    alert('Prompt copied to clipboard! Share it with your team.');
  };

  const handleTopup = () => {
    setBillingSuccess(true);
    setTimeout(() => {
      setCreditBalance(prev => prev + 50);
      setIsBillingOpen(false);
      setBillingSuccess(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <span className="text-sm font-semibold tracking-wider uppercase font-display">Verifying credentials...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header Navigation */}
      <Navbar 
        creditBalance={creditBalance} 
        userTier={tier}
        onBuyCreditsClick={() => setIsBillingOpen(true)}
      />

      {/* Main Studio Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Desktop Sidebar Controls (hidden on mobile) */}
        <aside className="hidden md:block w-[340px] flex-shrink-0 border-r border-border bg-card/40">
          <StudioSidebar 
            onGenerate={handleGenerate} 
            isGenerating={status === 'pending' || status === 'processing'}
            creditBalance={creditBalance}
            initialParams={initialParams}
          />
        </aside>

        {/* Studio Main Workspace (Canvas + History) */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          
          {/* Floating toggle controls for mobile/small screen sizes */}
          <div className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <span className="text-xs font-semibold text-zinc-400">STUDIO CANVAS</span>
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger className="inline-flex items-center justify-center rounded-lg border border-border hover:bg-zinc-900 bg-transparent px-3 py-1.5 h-8 text-zinc-350 hover:text-white gap-1.5 cursor-pointer text-xs font-semibold transition-colors duration-150">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>Configure Settings</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[310px] p-0 bg-card border-r border-border text-zinc-200">
                <div className="h-full flex flex-col pt-6">
                  <StudioSidebar 
                    onGenerate={handleGenerate} 
                    isGenerating={status === 'pending' || status === 'processing'}
                    creditBalance={creditBalance}
                    initialParams={initialParams}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Generation Preview Area */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <GenerationCanvas 
              generation={activeGen}
              status={status}
              progressText={progressText}
              progressPercent={progressPercent}
              onRemix={handleRemix}
              onTogglePublic={handleTogglePublic}
              onShare={handleShare}
            />
          </div>

          {/* Bottom Generation History Scroller */}
          <GenerationHistory 
            generations={generations}
            activeId={activeGen?.id || null}
            onSelect={handleSelectGeneration}
          />
        </main>
      </div>

      {/* Buy Credits Stripe Simulation Modal */}
      <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
        <DialogContent className="bg-card border-border text-zinc-105 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
              <span>Purchase Credits</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-1">
              Top up your balance instantly using Stripe. Select your desired package.
            </DialogDescription>
          </DialogHeader>

          {billingSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/50 flex items-center justify-center mb-3">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-200">Payment Successful!</h4>
              <p className="text-xs text-zinc-550 mt-1">Adding 50 credits to your wallet...</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Product Card choice */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-zinc-200 text-sm">Starter Booster pack</span>
                  <span className="text-[10px] text-zinc-400">50 standard studio generation credits</span>
                </div>
                <span className="text-sm font-black text-primary">$5.00</span>
              </div>
              
              <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-semibold uppercase bg-zinc-950 p-2 rounded-lg border border-border">
                <CreditCard className="h-4 w-4 text-zinc-400" />
                <span>Simulated Secure Stripe Checkout Session</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsBillingOpen(false)}
              disabled={billingSuccess}
              className="border-border hover:bg-zinc-900 text-zinc-300 text-xs rounded-xl h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTopup} 
              disabled={billingSuccess}
              className="brand-gradient text-white text-xs font-semibold rounded-xl h-9 cursor-pointer"
            >
              Pay $5.00
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-background flex flex-col items-center justify-center text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <span className="text-sm font-semibold tracking-wider uppercase font-display">Loading Studio Canvas...</span>
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
