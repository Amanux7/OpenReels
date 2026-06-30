'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings2, 
  Dices, 
  Video, 
  Image as ImageIcon,
  Square,
  Tv,
  Smartphone,
  Image,
  Monitor,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODELS, ASPECT_RATIOS } from '@/lib/constants';
import { GenerationParams } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StudioSidebarProps {
  onGenerate: (params: GenerationParams, type: 'image' | 'video') => void;
  isGenerating: boolean;
  creditBalance: number;
  initialParams?: Partial<GenerationParams> | null;
}

const SUGGESTED_PROMPTS = [
  "A majestic gold dragon perched on top of a futuristic skyscraper, dramatic lighting, synthwave style",
  "Close-up portrait of a colorful cybernetic cat, neon glowing whiskers, digital art, high fidelity",
  "A cozy cottage in a rainy forest, warm lights glowing inside, photorealistic, cinematic atmosphere",
  "Cinematic shot of an ancient underwater city ruins, glowing corals, scuba diver floating, 8k resolution"
];

export function StudioSidebar({ onGenerate, isGenerating, creditBalance, initialParams }: StudioSidebarProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageReference, setImageReference] = useState('');
  
  // Filter models based on activeTab
  const availableModels = MODELS.filter(m => m.type === activeTab);
  const [selectedModelId, setSelectedModelId] = useState(availableModels[0]?.id || MODELS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  
  // Advanced parameters states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | undefined>(undefined);

  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const isCreditsSufficient = creditBalance >= selectedModel.cost_credits;

  // Sync initial parameters when remixing
  useEffect(() => {
    if (initialParams) {
      if (initialParams.prompt !== undefined) setPrompt(initialParams.prompt);
      if (initialParams.negative_prompt !== undefined) setNegativePrompt(initialParams.negative_prompt);
      if (initialParams.aspect_ratio !== undefined) setSelectedAspectRatio(initialParams.aspect_ratio);
      if (initialParams.num_inference_steps !== undefined) setSteps(initialParams.num_inference_steps);
      if (initialParams.guidance_scale !== undefined) setGuidanceScale(initialParams.guidance_scale);
      if (initialParams.image_reference !== undefined) setImageReference(initialParams.image_reference || '');

      if (initialParams.seed !== undefined) setSeed(initialParams.seed);
      if (initialParams.model_used !== undefined) {
        setSelectedModelId(initialParams.model_used);
        const model = MODELS.find(m => m.id === initialParams.model_used);
        if (model) {
          setActiveTab(model.type);
        }
      }
    }
  }, [initialParams]);

  // Handle Tab Switch
  const handleTabChange = (val: string) => {
    const nextTab = val as 'image' | 'video';
    setActiveTab(nextTab);
    const filtered = MODELS.filter(m => m.type === nextTab);
    if (filtered.length > 0) {
      setSelectedModelId(filtered[0].id);
    }
  };

  const handleRollPrompt = () => {
    const randomIndex = Math.floor(Math.random() * SUGGESTED_PROMPTS.length);
    setPrompt(SUGGESTED_PROMPTS[randomIndex]);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 9999999999));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || !isCreditsSufficient) return;

    onGenerate(
      {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        aspect_ratio: selectedAspectRatio,
        model_used: selectedModelId,
        image_reference: imageReference.trim() || undefined,
        num_inference_steps: steps,
        guidance_scale: guidanceScale,
        seed: seed !== undefined ? seed : Math.floor(Math.random() * 9999999999),
      },
      activeTab
    );
  };

  // Render aspect ratio icon
  const getAspectRatioIcon = (iconName: string) => {
    switch (iconName) {
      case 'Square': return <Square className="h-4 w-4" />;
      case 'Tv': return <Tv className="h-4 w-4" />;
      case 'Smartphone': return <Smartphone className="h-4 w-4" />;
      case 'Image': return <ImageIcon className="h-4 w-4" />;
      case 'Monitor': return <Monitor className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card/60 p-5 overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Step 1: Mode Selection (Image vs Video) */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">
            Generation Mode
          </Label>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-border p-1">
              <TabsTrigger 
                value="image"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-1.5 cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 mr-2 inline" />
                Image
              </TabsTrigger>
              <TabsTrigger 
                value="video"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-1.5 cursor-pointer"
              >
                <Video className="h-3.5 w-3.5 mr-2 inline" />
                Video
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Step 2: Model Picker */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">
            AI Model
          </Label>
          <Select value={selectedModelId} onValueChange={(val) => { if (val) setSelectedModelId(val); }}>
            <SelectTrigger className="w-full bg-zinc-905 border-border focus:ring-primary/20 text-zinc-200">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-zinc-200">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{model.name}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2.5: Reference Image input for Image-to-Video or Image-to-Image editing */}
        {(activeTab === 'video' || selectedModelId === 'nanobanana') && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <Label className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">
              {activeTab === 'video' ? 'Reference Image (Image-to-Video)' : 'Source Image (Image-to-Image Editing)'}
            </Label>
            <Input 
              type="text"
              placeholder="Paste image URL or Base64 string (optional)"
              value={imageReference}
              onChange={(e) => setImageReference(e.target.value)}
              className="bg-zinc-900 border-border focus:ring-primary/20 text-zinc-200 placeholder-zinc-650 h-10 text-xs"
            />
          </div>
        )}

        {/* Step 3: Prompt Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">
              Prompt
            </Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleRollPrompt}
              className="h-6 text-[10px] font-semibold text-primary hover:text-red-400 hover:bg-primary/10 px-2 rounded-md cursor-pointer"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Surprise me
            </Button>
          </div>
          <div className="relative">
            <Textarea
              placeholder={
                activeTab === 'image' 
                  ? "Describe what you want to generate (e.g. 'a neon unicorn jumping over a galaxy, digital art...')" 
                  : "Describe the motion or video scene (e.g. 'camera pans across a misty forest revealing ruins...')"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] w-full bg-zinc-900/40 border-border focus:ring-primary/20 text-zinc-200 placeholder-zinc-500 resize-none pr-8 py-2.5"
            />
            {prompt && (
              <span className="absolute bottom-2 right-2.5 text-[10px] text-zinc-650 font-medium">
                {prompt.length}
              </span>
            )}
          </div>
        </div>

        {/* Step 4: Aspect Ratio */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">
            Aspect Ratio
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {ASPECT_RATIOS.map((ratio) => {
              const isActive = selectedAspectRatio === ratio.value;
              return (
                <Tooltip key={ratio.value}>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedAspectRatio(ratio.value)}
                        className={`h-11 rounded-lg p-0 flex flex-col items-center justify-center border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      />
                    }
                  >
                    {getAspectRatioIcon(ratio.icon)}
                    <span className="text-[10px] mt-1 font-semibold">{ratio.value}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border text-zinc-200 text-xs">
                    <p className="font-semibold">{ratio.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{ratio.width} x {ratio.height}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Step 5: Collapsible Advanced Settings */}
        <div className="border border-border rounded-xl bg-zinc-900/20 overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full h-11 px-4 flex items-center justify-between text-zinc-350 font-medium text-xs hover:bg-zinc-900/40 rounded-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <span>Advanced Parameters</span>
            </div>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAdvanced && (
            <div className="p-4 pt-2 border-t border-border space-y-4 bg-zinc-950/20">
              
              {/* Negative Prompt */}
              <div className="space-y-1.5">
                <Label className="text-zinc-500 text-[11px] font-semibold">Negative Prompt</Label>
                <Input
                  placeholder="Elements to avoid (e.g. low quality, blurry)"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="h-8 bg-zinc-900/40 border-border text-xs text-zinc-200 placeholder-zinc-650 focus:ring-primary/20"
                />
              </div>

              {/* Steps Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <Label className="text-zinc-500 font-semibold">Steps</Label>
                  <span className="text-primary font-semibold">{steps}</span>
                </div>
                <Slider
                  min={10}
                  max={50}
                  step={1}
                  value={[steps]}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : val;
                    if (typeof num === 'number') setSteps(num);
                  }}
                  className="py-1 cursor-pointer"
                />
              </div>

              {/* CFG Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <Label className="text-zinc-500 font-semibold">CFG Scale (Guidance)</Label>
                  <span className="text-primary font-semibold">{guidanceScale}</span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={0.5}
                  value={[guidanceScale]}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : val;
                    if (typeof num === 'number') setGuidanceScale(num);
                  }}
                  className="py-1 cursor-pointer"
                />
              </div>

              {/* Seed */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <Label className="text-zinc-500 font-semibold">Seed</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRandomSeed}
                    className="h-5 px-1 text-[10px] text-primary hover:bg-transparent"
                  >
                    <Dices className="h-3 w-3 mr-1" />
                    Randomize
                  </Button>
                </div>
                <Input
                  type="number"
                  placeholder="Random"
                  value={seed !== undefined ? seed : ''}
                  onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-8 bg-zinc-900/40 border-border text-xs text-zinc-200 placeholder-zinc-650 focus:ring-primary/20"
                />
              </div>

            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Action Button: Generate */}
        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim() || !isCreditsSufficient}
            className="w-full h-11 brand-gradient text-white font-semibold text-sm rounded-xl shadow-lg border-0 cursor-pointer shadow-red-950/20 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Video/Image</span>
              </div>
            )}
          </Button>

          {/* Cost breakdown details */}
          <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 font-medium">
            <span>Estimated cost:</span>
            <span className="text-amber-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 inline" />
              {selectedModel.cost_credits} {selectedModel.cost_credits === 1 ? 'credit' : 'credits'}
            </span>
          </div>

          {!isCreditsSufficient && (
            <p className="text-[11px] text-red-500 text-center font-medium">
              Insufficient credits. Please upgrade or top up.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
export default StudioSidebar;
