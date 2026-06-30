'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Film, ArrowRight, Zap, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const BILLING_TIERS = [
  {
    name: 'Free Plan',
    price: '$0',
    frequency: 'forever',
    description: 'Experiment with basic tools and experience the serverless studio.',
    credits: '50 Credits once',
    features: [
      'Access to SDXL & Flux Schnell models',
      'Standard low-priority container queue',
      'Simulated webhook completion',
      'Download public outputs',
      'Community Explore feed access'
    ],
    cta: 'Current Plan',
    popular: false,
    costCredits: 50
  },
  {
    name: 'Creator Pack',
    price: '$15',
    frequency: 'month',
    description: 'Our most popular choice. Designed for hobbyists and digital artists.',
    credits: '1,000 Credits/mo',
    features: [
      'Access to all models including Flux Dev',
      'Stable Video Diffusion (SVD) support',
      'Accelerated priority GPU queues',
      'High-res downloads (PNG/MP4)',
      'Uncapped rendering speeds',
      'Save unlimited prompt parameter presets'
    ],
    cta: 'Upgrade to Creator',
    popular: true,
    costCredits: 1000
  },
  {
    name: 'Production Tier',
    price: '$45',
    frequency: 'month',
    description: 'For agencies, production studios, and high-volume media generation.',
    credits: 'Unlimited Credits',
    features: [
      'Uncapped GPU node access',
      'Multi-container parallel generation',
      'Dedicated enterprise-tier server container',
      'Early access to model releases',
      'Custom webhook integration',
      'API access endpoint key'
    ],
    cta: 'Go Production Unlimited',
    popular: false,
    costCredits: 99999
  }
];

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<typeof BILLING_TIERS[0] | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgradeClick = (tier: typeof BILLING_TIERS[0]) => {
    if (tier.costCredits === 50) return; // already free
    setSelectedTier(tier);
  };

  const handleCheckoutSubmit = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedTier(null);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-150 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar creditBalance={50} userTier="free" />

      {/* Main pricing grid canvas */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full flex flex-col justify-center">
        
        {/* Page title */}
        <div className="text-center space-y-4 mb-16 select-none">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(229,9,20,0.1)]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="uppercase tracking-wider">Transparent Billing Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-6xl font-black tracking-wider text-white font-display">
            UPGRADE YOUR WORKSPACE
          </h1>
          <p className="text-zinc-550 text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-relaxed">
            Choose the volume that fits your production workload. All transactions are simulated securely using Stripe checkout nodes.
          </p>
        </div>

        {/* 3 Columns Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto w-full">
          {BILLING_TIERS.map((tier) => (
            <div 
              key={tier.name}
              className={`rounded-2xl border bg-card flex flex-col p-8 transition-all duration-300 relative ${
                tier.popular 
                  ? 'border-primary shadow-[0_0_40px_rgba(229,9,20,0.18)] scale-[1.02] md:-translate-y-2' 
                  : 'border-border shadow-md hover:border-zinc-500'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(229,9,20,0.4)]">
                  Most Popular
                </span>
              )}

              {/* Pricing Headers */}
              <div className="mb-6 flex-grow-0">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  {tier.name}
                </span>
                
                <div className="flex items-baseline gap-1.5 text-[#f5f5f1]">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight font-display">{tier.price}</span>
                  <span className="text-zinc-500 text-xs font-semibold lowercase">/ {tier.frequency}</span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 fill-primary/10" />
                  <span>{tier.credits}</span>
                </div>
                
                <p className="mt-4 text-xs text-zinc-400 leading-relaxed font-semibold">
                  {tier.description}
                </p>
              </div>

              <hr className="border-border my-6" />

              {/* Features list */}
              <div className="flex-1 mb-8">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-4 select-none">
                  Included Features
                </span>
                <ul className="space-y-3.5">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs font-semibold text-zinc-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Action button */}
              <div className="mt-auto">
                <Button
                  onClick={() => handleUpgradeClick(tier)}
                  disabled={tier.costCredits === 50}
                  className={`w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 ${
                    tier.costCredits === 50
                      ? 'bg-transparent border border-border text-zinc-500 cursor-not-allowed hover:bg-transparent'
                      : tier.popular
                        ? 'bg-primary hover:bg-[#b20710] text-[#f5f5f1] hover:scale-[1.01] uppercase-action shadow-lg shadow-red-950/20'
                        : 'bg-transparent border border-border hover:border-zinc-400 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {tier.cta}
                </Button>
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* Stripe checkout simulation Modal */}
      <Dialog open={selectedTier !== null} onOpenChange={(open) => { if (!open) setSelectedTier(null); }}>
        {selectedTier && (
          <DialogContent className="bg-card border-border text-zinc-100 max-w-sm rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-wider">
                <Film className="h-5 w-5 text-primary" />
                <span>STRIPE CHECKOUT</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs mt-1">
                Authorize purchase session for {selectedTier.name} package.
              </DialogDescription>
            </DialogHeader>

            {success ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-950 text-emerald-450 border border-emerald-900/50 flex items-center justify-center mb-3 animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-zinc-100">Upgrade Successful!</h4>
                <p className="text-xs text-zinc-500 mt-1">Your new balance is now active.</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-200 text-xs uppercase tracking-wider">{selectedTier.name} subscription</span>
                    <span className="text-[10px] text-zinc-500">{selectedTier.credits} allocation</span>
                  </div>
                  <span className="text-sm font-black text-primary">{selectedTier.price}</span>
                </div>

                <div className="p-3 bg-zinc-950 border border-border rounded-lg flex items-center gap-2.5 text-[10px] text-zinc-550 font-bold uppercase tracking-wider select-none">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Stripe test environment active</span>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTier(null)}
                disabled={checkoutLoading || success}
                className="flex-1 border-border hover:bg-zinc-900 text-zinc-350 text-xs rounded-xl h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckoutSubmit}
                disabled={checkoutLoading || success}
                className="flex-1 bg-primary hover:bg-[#b20710] text-[#f5f5f1] text-xs font-bold uppercase tracking-wider rounded-xl h-9 cursor-pointer uppercase-action"
              >
                {checkoutLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Pay {selectedTier.price}</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
}
