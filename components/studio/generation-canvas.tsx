'use client';

import React from 'react';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle,
  Play,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Generation, GenerationStatus } from '@/lib/types';
import Image from 'next/image';

interface GenerationCanvasProps {
  generation: Generation | null;
  status: 'idle' | GenerationStatus;
  progressText?: string;
  progressPercent?: number;
  onRemix?: (gen: Generation) => void;
  onTogglePublic?: (id: string, currentVal: boolean) => void;
  onDownload?: (gen: Generation) => void;
  onShare?: (gen: Generation) => void;
}

export function GenerationCanvas({
  generation,
  status,
  progressText = 'Preparing...',
  progressPercent = 0,
  onRemix,
  onTogglePublic,
  onDownload,
  onShare
}: GenerationCanvasProps) {

  // Visual aspect ratio styling class mapping
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16] max-h-[65vh]';
      case '4:3': return 'aspect-[4/3]';
      case '21:9': return 'aspect-[21/9]';
      case '1:1':
      default: return 'aspect-square';
    }
  };

  const handleDownload = () => {
    if (!generation) return;
    if (onDownload) {
      onDownload(generation);
    } else {
      // Default browser download trigger
      const url = generation.image_url || generation.video_url;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `openreel-${generation.id}.${generation.generation_type === 'video' ? 'mp4' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // Render Idle/Empty State
  if (status === 'idle' && !generation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[450px]">
        <div className="relative group max-w-md">
          {/* Animated colorful outline */}
          <div className="absolute -inset-0.5 rounded-3xl brand-gradient opacity-30 blur-xl group-hover:opacity-50 transition duration-1000 animate-pulse" />
          
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-purple-400 border border-zinc-700/50 mb-4 shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Create Something Magical</h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm">
              Configure parameters on the left sidebar and click generate. Watch AI bring your vision to life as images or cinematic videos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading/Processing State
  if (status === 'pending' || status === 'processing') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[450px]">
        <div className="w-full max-w-lg space-y-6">
          {/* Mock loader window with progress */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-sm">
            {/* Progress shimmer border */}
            <div 
              className="absolute top-0 left-0 h-1 brand-gradient transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
            
            <div className="flex flex-col items-center justify-center">
              {/* Rotating spinner inside glowing container */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-850 text-purple-400 border border-zinc-750/50 mb-6 shadow-inner animate-pulse">
                <div className="absolute inset-0 rounded-2xl border border-purple-500/20 animate-spin border-t-purple-500 border-r-transparent border-b-transparent" />
                <Film className="h-6 w-6 animate-pulse" />
              </div>
              
              <h3 className="text-base font-bold text-zinc-200 uppercase tracking-wide">
                Rendering Generation
              </h3>
              <p className="mt-1 text-sm text-purple-400 font-semibold">
                {progressText}
              </p>
              
              {/* Animated Progress Bar */}
              <div className="w-full bg-zinc-950 border border-zinc-850 h-2.5 rounded-full mt-6 overflow-hidden">
                <div 
                  className="brand-gradient h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <div className="flex justify-between w-full mt-2 text-[10px] text-zinc-500 font-semibold">
                <span>STAGE 1: QUEUEING</span>
                <span>{progressPercent}%</span>
                <span>STAGE 4: COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Failed State
  if (status === 'failed' || (generation && generation.status === 'failed')) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[450px]">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950 text-red-400 border border-red-900/50 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">Generation Failed</h3>
          <p className="mt-1.5 text-xs text-zinc-500">
            {generation?.error_message || 'An error occurred during GPU execution. No credits were charged.'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4 border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs cursor-pointer"
            onClick={() => generation && onRemix?.(generation)}
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Retry parameters
          </Button>
        </div>
      </div>
    );
  }

  if (!generation) return null;

  // Render Complete State
  return (
    <div className="flex flex-col flex-1 p-6 gap-5">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 font-semibold tracking-wide uppercase">
              Model:
            </span>
            <Badge variant="outline" className="border-purple-500/20 bg-purple-950/20 text-purple-400 text-[10px] font-semibold">
              {generation.model_used}
            </Badge>
            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px]">
              Seed: {generation.seed}
            </Badge>
          </div>
          <p className="text-zinc-400 text-xs italic line-clamp-1 max-w-xl mt-1.5">
            "{generation.prompt}"
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onTogglePublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTogglePublic(generation.id, generation.is_public)}
              className="h-8 border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs cursor-pointer"
            >
              {generation.is_public ? (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                  <span>Public Feed</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                  <span>Private</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Download</span>
          </Button>

          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(generation)}
              className="h-8 border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Share</span>
            </Button>
          )}

          {onRemix && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemix(generation)}
              className="h-8 border-purple-500/20 hover:border-purple-500/50 bg-purple-950/10 hover:bg-purple-950/20 text-purple-400 font-medium text-xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>Remix</span>
            </Button>
          )}
        </div>
      </div>

      {/* Generation Display Canvas */}
      <div className="flex-1 flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl relative min-h-[350px]">
        {/* Soft colorful background glow */}
        <div className="absolute inset-0 brand-gradient opacity-5 blur-2xl pointer-events-none" />

        <div className={`w-full max-w-full max-h-[60vh] flex items-center justify-center p-4`}>
          <div className={`relative ${getAspectRatioClass(generation.aspect_ratio)} overflow-hidden rounded-xl border border-zinc-800 shadow-inner w-full max-w-3xl flex items-center justify-center bg-zinc-900/60 transition-transform duration-500 hover:scale-[1.005]`}>
            {generation.generation_type === 'video' && generation.video_url ? (
              <video 
                src={generation.video_url} 
                controls 
                autoPlay 
                loop 
                muted 
                className="w-full h-full object-contain"
              />
            ) : (
              generation.image_url && (
                <img
                  src={generation.image_url}
                  alt={generation.prompt}
                  className="w-full h-full object-contain select-none"
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default GenerationCanvas;
