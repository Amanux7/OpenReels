'use client';

import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Shield, 
  Zap, 
  Heart, 
  Image as ImageIcon, 
  Smile, 
  Globe, 
  Volume2, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { name: 'Director', model: 'seedance', icon: Film, isNew: true },
  { name: 'Video', model: 'kling', icon: Play, isNew: false },
  { name: 'Image', model: 'google-imagen', icon: ImageIcon, isNew: false },
  { name: 'Character', model: 'nanobanana', icon: Smile, isNew: false },
  { name: 'World', model: 'flux-dev', icon: Globe, isNew: false },
  { name: 'Audio', model: 'svd', icon: Volume2, isNew: false }
];

const SLIDES = [
  {
    image: '/mock-generations/cyberpunk_singer.png',
    prompt: 'Male singer with braided hair performing into classic metal microphone under blue stage spotlight, hyper-detailed, cinematic photography.',
    author: '@vibe_director',
    likes: 342,
    aspect: '9:16'
  },
  {
    image: '/mock-generations/girl_bag.png',
    prompt: 'Young woman in cozy cream cardigan holding canvas tote bag in modern apartment, soft lighting, photorealistic.',
    author: '@fashion_creator',
    likes: 218,
    aspect: '1:1'
  },
  {
    image: '/mock-generations/red_sunglasses.png',
    prompt: 'Glossy retro red sunglasses resting on minimalist gradient red backdrop, studio lighting, hyper-realistic, high resolution.',
    author: '@sunglass_style',
    likes: 289,
    aspect: '16:9'
  },
  {
    image: '/mock-generations/woman_sweeping.png',
    prompt: 'Determined woman in bright yellow rain jacket holding a broom, misty and smoky atmosphere, cinematic action framing.',
    author: '@cinematic_eye',
    likes: 412,
    aspect: '4:3'
  },
  {
    image: '/mock-generations/cyberpunk_city.png',
    prompt: 'Cyberpunk metropolis at night with glowing purple neon billboards, flying vehicles, and rain-slicked streets, 8k resolution.',
    author: '@neo_matrix',
    likes: 580,
    aspect: '21:9'
  },
  {
    image: '/mock-generations/mystical_forest.png',
    prompt: 'Enchanted mystical forest at twilight, bioluminescent glowing mushrooms and sparkling streams, magical atmosphere.',
    author: '@fairy_nature',
    likes: 367,
    aspect: '1:1'
  },
  {
    image: '/mock-generations/futuristic_astronaut.png',
    prompt: 'Futuristic astronaut standing on rust alien soil looking at giant gas giant planet in the starfield nebula sky.',
    author: '@star_voyager',
    likes: 494,
    aspect: '9:16'
  }
];

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f1] relative flex flex-col overflow-hidden font-sans">
      
      {/* Premium Cinematic Ambient Backdrops */}
      <div className="absolute top-0 left-0 w-full h-[75vh] bg-gradient-to-b from-[#e50914]/6 via-transparent to-[#0a0a0a] pointer-events-none z-0" />
      <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-950/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-25 w-full border-b border-zinc-900 bg-[#0a0a0a]/60 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(229,9,20,0.15)]">
              <Film className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-gradient">
              OpenReel
            </span>
          </div>

          {/* Links & CTA */}
          <div className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="ghost" className="text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer">
                Explore Feed
              </Button>
            </Link>
            <Link href="/studio">
              <Button size="sm" className="bg-primary hover:bg-[#b20710] text-[#f5f5f1] font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border-0 h-9 px-4 cursor-pointer transition-all duration-200">
                Studio Canvas
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto pt-16 pb-20">
        
        {/* Cinematic Headline with Stylized 3D Cursor */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-[1.1] text-zinc-100 select-none font-display">
          What would you like <br />
          <span className="inline-flex items-center justify-center gap-2 mt-2">
            to create today?
            <span className="inline-flex relative h-9 w-9 align-middle">
              <svg viewBox="0 0 32 32" className="w-9 h-9 filter drop-shadow-[0_2px_12px_rgba(59,130,246,0.7)] animate-pulse">
                <path d="M5.5 2v23.5l6.5-6.5h11z" fill="url(#cursorGradient)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="cursorGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#e50914" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </span>
        </h1>

        {/* Categories Tab Selector Bar */}
        <div className="mt-8 mb-12 inline-flex items-center gap-1 p-1 bg-zinc-950/70 border border-zinc-800/80 rounded-full backdrop-blur-md shadow-2xl max-w-full overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat, idx) => (
            <Link key={cat.name} href={`/studio?model=${cat.model}`}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-zinc-900/60 text-zinc-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider relative cursor-pointer group whitespace-nowrap">
                {cat.isNew && (
                  <span className="absolute -top-3.5 right-1.5 bg-[#10b981] text-zinc-950 font-black text-[8px] px-1.5 py-0.5 rounded-md tracking-tighter uppercase border border-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                    NEW
                  </span>
                )}
                <cat.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-primary transition-colors" />
                <span>{cat.name}</span>
                <ChevronDown className="h-3 w-3 text-zinc-650 group-hover:text-zinc-400" />
              </button>
            </Link>
          ))}
        </div>

        {/* curved panorama curved theater slideshow */}
        <div className="relative w-full overflow-hidden py-4 flex flex-col items-center justify-center">
          
          {/* Main Glowing Header */}
          <h2 className="text-5xl sm:text-7xl font-extrabold text-center text-[#e50914] drop-shadow-[0_0_25px_rgba(229,9,20,0.85)] mb-10 tracking-tight font-display">
            DIRECT YOUR VISION
          </h2>

          {/* Panoramic Slide Viewport */}
          <div className="relative w-full max-w-6xl h-[410px] flex items-center justify-center px-4" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            
            {/* Left Button */}
            <button 
              onClick={handlePrev} 
              className="absolute left-4 lg:left-8 z-40 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-all duration-150 backdrop-blur-md active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Cylinder Transform Slides */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
              {SLIDES.map((slide, idx) => {
                // Calculate circular offset relative to currentIndex
                let offset = idx - currentIndex;
                if (offset < -3) offset += SLIDES.length;
                if (offset > 3) offset -= SLIDES.length;

                const isCenter = offset === 0;
                
                // Determine 3D transform strings
                let transformStr = "";
                let zIndex = 0;
                let opacity = 0;
                let pointerEvents: 'auto' | 'none' = 'none';

                if (offset === 0) {
                  transformStr = "translateX(0px) translateZ(50px) rotateY(0deg) scale(1.05)";
                  zIndex = 30;
                  opacity = 1;
                  pointerEvents = 'auto';
                } else if (offset === 1) {
                  transformStr = "translateX(250px) translateZ(0px) rotateY(-18deg) scale(0.95)";
                  zIndex = 20;
                  opacity = 0.85;
                  pointerEvents = 'auto';
                } else if (offset === -1) {
                  transformStr = "translateX(-250px) translateZ(0px) rotateY(18deg) scale(0.95)";
                  zIndex = 20;
                  opacity = 0.85;
                  pointerEvents = 'auto';
                } else if (offset === 2) {
                  transformStr = "translateX(460px) translateZ(-80px) rotateY(-32deg) scale(0.85)";
                  zIndex = 10;
                  opacity = 0.5;
                } else if (offset === -2) {
                  transformStr = "translateX(-460px) translateZ(-80px) rotateY(32deg) scale(0.85)";
                  zIndex = 10;
                  opacity = 0.5;
                } else if (offset === 3) {
                  transformStr = "translateX(620px) translateZ(-150px) rotateY(-45deg) scale(0.75)";
                  zIndex = 5;
                  opacity = 0.15;
                } else if (offset === -3) {
                  transformStr = "translateX(-620px) translateZ(-150px) rotateY(45deg) scale(0.75)";
                  zIndex = 5;
                  opacity = 0.15;
                }

                return (
                  <div
                    key={idx}
                    className={`absolute w-[220px] h-[320px] rounded-2xl overflow-hidden border transition-all duration-500 ease-out cursor-pointer group ${
                      isCenter 
                        ? 'border-[#e50914] shadow-[0_0_30px_rgba(229,9,20,0.45)]' 
                        : 'border-zinc-800 shadow-2xl hover:border-zinc-500'
                    }`}
                    style={{
                      transform: transformStr,
                      zIndex: zIndex,
                      opacity: opacity,
                      pointerEvents: pointerEvents,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s, border 0.3s'
                    }}
                    onClick={() => {
                      if (!isCenter) {
                        setCurrentIndex(idx);
                      }
                    }}
                  >
                    <div className="relative w-full h-full bg-zinc-900">
                      <img 
                        src={slide.image} 
                        alt="Generation output" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Panoramic Slide Information Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
                          {slide.author}
                        </span>
                        <p className="text-xs text-white font-medium line-clamp-3 leading-relaxed mb-2">
                          "{slide.prompt}"
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase">
                            <Heart className="h-3 w-3 text-[#e50914] fill-[#e50914]" />
                            {slide.likes}
                          </span>
                          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-bold">
                            {slide.aspect}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Button */}
            <button 
              onClick={handleNext} 
              className="absolute right-4 lg:right-8 z-40 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-all duration-150 backdrop-blur-md active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Curved Arch Pink Line and Ambient Shadow (matching screenshot) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-[80px] border-t border-[#e50914]/25 rounded-[50%/100%_100%_0_0] blur-[0.5px] pointer-events-none shadow-[0_-15px_30px_rgba(229,9,20,0.1)]" />
        </div>

        {/* Feature Grid */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-550 font-bold uppercase tracking-wider select-none">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded-xl">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Google Imagen & Gemini Flash</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded-xl">
            <Play className="h-3.5 w-3.5 text-primary" />
            <span>Kling AI & Seedance Video</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded-xl">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Commercial License</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-950 bg-black/40 py-8 text-center text-xs text-zinc-650 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 OpenReel Studio. All rights reserved. Designed for digital creators.</p>
          <div className="flex gap-6 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            <Link href="/explore" className="hover:text-primary transition-colors">Explore</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/studio" className="hover:text-primary transition-colors">Studio</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
