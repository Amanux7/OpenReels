'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, ShieldCheck, Film, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const LOADING_STEPS = [
  'Connecting secure account pipeline...',
  'Provisioning serverless container workspace...',
  'Checking GPU cluster occupancy...',
  'Allocating node resources...',
  'Simulating initial billing ledger setup...',
  'Finalizing environment configuration...'
];

export default function OnboardingPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const totalDuration = 3200; // 3.2s
    const stepIntervalTime = totalDuration / LOADING_STEPS.length;
    const progressIntervalTime = 40; // update progress bar quickly
    const startTime = Date.now();

    // Step updating
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, stepIntervalTime);

    // Progress percentage updating
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgressPercent(pct);
      
      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        setIsOnboardingComplete(true);
        setIsDialogOpen(true);
      }
    }, progressIntervalTime);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleEnterStudio = () => {
    setIsDialogOpen(false);
    // Push the user straight into the Studio workspace
    router.push('/studio');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#141414] text-zinc-100 font-sans p-6 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[30%] w-[30%] h-[30%] rounded-full bg-red-900/5 blur-[100px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        
        {/* Top brand identifier */}
        <div className="flex items-center gap-2 mb-12 select-none">
          <Film className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-tight text-brand-gradient">OpenReel Onboarding</span>
        </div>

        {/* Loader Screen Container */}
        <div className="w-full rounded-2xl border border-border bg-[#181818]/60 p-8 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          
          {/* Central Spinner Graphic */}
          <div className="relative h-20 w-20 mx-auto mb-8 flex items-center justify-center select-none">
            <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800" />
            <div 
              className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent border-r-transparent animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
            <Zap className="h-6 w-6 text-primary animate-pulse" />
          </div>

          <h3 className="text-md font-bold uppercase tracking-wider text-[#f5f5f1] mb-2 font-display">
            Configuring Workspace
          </h3>
          
          {/* Dynamic Step Text */}
          <p className="text-zinc-500 text-xs font-semibold h-4 mb-8">
            {LOADING_STEPS[currentStep]}
          </p>

          {/* Progress Percent & Bar */}
          <div className="w-full bg-zinc-950 border border-border h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>

        </div>

      </div>

      {/* Onboarding Complete Welcome Dialog Overlay */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="bg-card border-border text-zinc-100 max-w-sm rounded-2xl p-6"
          showCloseButton={false} // Force action button click
        >
          <DialogHeader className="flex flex-col items-center text-center">
            
            {/* Glowing Trophy / Badge Graphic */}
            <div className="relative h-20 w-20 flex items-center justify-center mb-4 select-none">
              <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/25 animate-ping" />
              <div className="relative h-16 w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                <Zap className="h-8 w-8 text-primary fill-primary/20" />
              </div>
            </div>

            <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white font-display">
              WORKSPACE READY!
            </DialogTitle>
            
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-[0_0_15px_rgba(229,9,20,0.15)] uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>+50 Credits Welcome Bonus</span>
            </div>

            <DialogDescription className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Your serverless OpenReel account is active. We have credited your account with 50 generation credits so you can start creating photorealistic images and high-fidelity videos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col gap-2 mt-4">
            <Button 
              onClick={handleEnterStudio}
              className="w-full bg-primary hover:bg-[#b20710] text-[#f5f5f1] font-bold text-xs uppercase tracking-wider rounded-xl h-11 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform uppercase-action"
            >
              <span>Launch Studio Canvas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
