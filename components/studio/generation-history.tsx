'use client';

import React from 'react';
import { Play, Film, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Generation } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GenerationHistoryProps {
  generations: Generation[];
  activeId: string | null;
  onSelect: (gen: Generation) => void;
}

export function GenerationHistory({
  generations,
  activeId,
  onSelect
}: GenerationHistoryProps) {
  if (generations.length === 0) {
    return (
      <div className="flex h-[110px] w-full items-center justify-center border-t border-zinc-900 bg-zinc-950/40 px-6">
        <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">
          No history yet. Start generating!
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-900 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Recent Generations
        </h4>
        <span className="text-[10px] text-zinc-500 font-medium">
          {generations.length} total
        </span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-zinc-900 bg-zinc-950/40 p-2.5">
        <div className="flex gap-3">
          {generations.map((gen) => {
            const isActive = activeId === gen.id;
            const isVideo = gen.generation_type === 'video';
            const displayUrl = gen.thumbnail_url || gen.image_url || '';

            return (
              <button
                key={gen.id}
                onClick={() => onSelect(gen)}
                className={`relative group flex-shrink-0 h-20 w-24 rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
                  isActive
                    ? 'border-purple-500 ring-1 ring-purple-500/30'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Image / Thumbnail */}
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt={gen.prompt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-1.5">
                  <span className="text-[8px] text-zinc-300 truncate font-medium">
                    {gen.prompt}
                  </span>
                </div>

                {/* Play/Film icon overlay for video */}
                {isVideo && (
                  <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded bg-black/60 text-purple-400 border border-purple-500/20 shadow-sm">
                    <Film className="h-2.5 w-2.5" />
                  </div>
                )}
                
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 brand-gradient" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="bg-zinc-950/20" />
      </ScrollArea>
    </div>
  );
}
export default GenerationHistory;
