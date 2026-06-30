'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Sparkles, Heart, RefreshCw, X, Eye, HelpCircle, Compass, User, Copy, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { MOCK_GENERATION_HISTORY } from '@/lib/constants';
import { Generation } from '@/lib/types';

// Let's create an expanded community feed list by duplicating/augmenting the mocks to show a rich Masonry gallery
const EXPLORE_ITEMS = [
  ...MOCK_GENERATION_HISTORY.map((item, index) => ({
    ...item,
    id: `explore-${index}-1`,
    likes_count: item.likes_count + 12,
    remix_count: item.remix_count + 2,
    author: {
      name: ['StellarAI', 'NeoGenesis', 'NebulaGraph', 'PixelForge'][index % 4],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${item.id}`
    }
  })),
  ...MOCK_GENERATION_HISTORY.map((item, index) => ({
    ...item,
    id: `explore-${index}-2`,
    prompt: item.prompt.replace('metropolis', 'skyline').replace('forest', 'valley').replace('astronaut', 'explorer').replace('pocket watch', 'hourglass'),
    image_url: [
      '/mock-generations/mystical_forest.png',
      '/mock-generations/cyberpunk_city.png',
      '/mock-generations/steampunk_watch.png',
      '/mock-generations/futuristic_astronaut.png'
    ][index],
    likes_count: Math.floor(item.likes_count / 2) + 5,
    remix_count: Math.floor(item.remix_count / 2) + 1,
    author: {
      name: ['PromptGod', 'ArtisanAI', 'RenderBoss', 'NeuralDream'][index % 4],
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=alt-${item.id}`
    }
  })),
  ...MOCK_GENERATION_HISTORY.map((item, index) => ({
    ...item,
    id: `explore-${index}-3`,
    prompt: 'Hyper-detailed cinematic render: ' + item.prompt,
    likes_count: item.likes_count + 25,
    remix_count: item.remix_count + 7,
    author: {
      name: ['Synthetix', 'VisualSage', 'AetherMind', 'DreamWeaver'][index % 4],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=three-${item.id}`
    }
  }))
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<typeof EXPLORE_ITEMS[0] | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Handle Download utility
  const handleDownload = (item: typeof EXPLORE_ITEMS[0]) => {
    const url = item.image_url;
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `openreel-community-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy prompt parameters
  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Remix - pushes parameters to Studio via query string
  const handleRemix = (item: typeof EXPLORE_ITEMS[0]) => {
    setSelectedAsset(null);
    
    // Construct query parameters
    const params = new URLSearchParams();
    params.set('prompt', item.prompt);
    params.set('negative_prompt', item.negative_prompt || '');
    params.set('aspect_ratio', item.aspect_ratio || '1:1');
    params.set('model', item.model_used || 'flux-schnell');
    params.set('steps', String(item.parameters.num_inference_steps || 30));
    params.set('guidance', String(item.parameters.guidance_scale || 7.5));
    params.set('seed', String(item.seed || Math.floor(Math.random() * 9999999999)));

    // Navigate to studio with parameters
    router.push(`/studio?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-150 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar creditBalance={50} userTier="free" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 select-none">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(229,9,20,0.1)]">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span className="uppercase tracking-wider">Community Showroom</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-white font-display">
              EXPLORE CREATIONS
            </h1>
            <p className="text-zinc-550 text-xs sm:text-sm font-semibold max-w-xl">
              Inspect generations submitted by creators globally. Copy prompts or remix them directly inside the Studio workspace in one click.
            </p>
          </div>
        </div>

        {/* CSS Column Masonry Gallery */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 w-full">
          {EXPLORE_ITEMS.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              className="break-inside-avoid relative rounded-xl border border-border bg-card overflow-hidden group shadow-lg hover:border-primary transition-all duration-300 cursor-pointer"
            >
              {/* Media Output */}
              <div className="relative w-full overflow-hidden bg-zinc-950">
                <img 
                  src={item.image_url || undefined} 
                  alt="Explore Generation" 
                  className="w-full h-auto object-cover max-h-[500px]"
                />

                {/* Hover overlay tray */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {/* User info */}
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <Avatar className="h-6 w-6 border border-zinc-800">
                      <AvatarImage src={item.author.avatar} />
                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-400">
                        {item.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold text-zinc-300 tracking-wider">
                      {item.author.name}
                    </span>
                  </div>

                  {/* Prompt snippet */}
                  <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed italic mb-3">
                    "{item.prompt}"
                  </p>

                  {/* Action tray */}
                  <div className="flex items-center justify-between border-t border-[#2f2f2f]/60 pt-2.5 select-none">
                    <div className="flex gap-3 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-primary fill-primary" />
                        {item.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 text-zinc-400" />
                        {item.remix_count}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[9px] font-bold tracking-wider uppercase">
                      {item.model_used}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Detailed Showcase Dialog Modal */}
      <Dialog open={selectedAsset !== null} onOpenChange={(open) => { if (!open) setSelectedAsset(null); }}>
        {selectedAsset && (
          <DialogContent className="bg-card border-border text-zinc-100 max-w-4xl rounded-2xl p-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Side: High-res Asset Preview */}
              <div className="md:col-span-7 bg-zinc-950 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-border relative min-h-[300px]">
                <div className="absolute inset-0 brand-gradient opacity-5 blur-2xl pointer-events-none" />
                <img 
                  src={selectedAsset.image_url || undefined} 
                  alt={selectedAsset.prompt}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border border-zinc-900 shadow-2xl"
                />
              </div>

              {/* Right Side: Detailed Metadata & Actions */}
              <div className="md:col-span-5 p-6 flex flex-col justify-between h-full bg-[#181818]">
                <div>
                  {/* Header Author Profile */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border select-none">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 border border-zinc-800">
                        <AvatarImage src={selectedAsset.author.avatar} />
                        <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">
                          {selectedAsset.author.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white tracking-wide">{selectedAsset.author.name}</span>
                        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">COMMUNITY CREATOR</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <Heart className="h-3.5 w-3.5 text-primary fill-primary" />
                      <span>{selectedAsset.likes_count} likes</span>
                    </div>
                  </div>

                  {/* Parameters list */}
                  <div className="space-y-4">
                    {/* Prompt Box */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <span>Generation Prompt</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopyPrompt(selectedAsset.prompt)}
                          className="h-5 px-1.5 text-primary hover:bg-primary/5 hover:text-red-400 gap-1 text-[9px] font-semibold cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-zinc-200 bg-zinc-950 p-3 rounded-lg border border-border italic leading-relaxed">
                        "{selectedAsset.prompt}"
                      </p>
                    </div>

                    {/* Negative Prompt */}
                    {selectedAsset.negative_prompt && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Negative elements excluded</span>
                        <p className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-border">
                          {selectedAsset.negative_prompt}
                        </p>
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-border flex flex-col gap-0.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">AI model</span>
                        <span className="font-semibold text-zinc-200">{selectedAsset.model_used}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-border flex flex-col gap-0.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">aspect ratio</span>
                        <span className="font-semibold text-zinc-200">{selectedAsset.aspect_ratio}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-border flex flex-col gap-0.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">seed parameter</span>
                        <span className="font-mono text-zinc-200 font-medium truncate">{selectedAsset.seed}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-border flex flex-col gap-0.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">guidance scale</span>
                        <span className="font-semibold text-zinc-200">{selectedAsset.parameters.guidance_scale || 7.5}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="mt-8 pt-4 border-t border-border flex gap-3 select-none">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedAsset)}
                    className="flex-1 h-10 border-border hover:bg-zinc-900 text-zinc-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                  <Button
                    onClick={() => handleRemix(selectedAsset)}
                    className="flex-1 h-10 bg-primary hover:bg-[#b20710] text-[#f5f5f1] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] transition-transform uppercase-action shadow-lg shadow-red-950/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Remix in Studio</span>
                  </Button>
                </div>

              </div>

            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
