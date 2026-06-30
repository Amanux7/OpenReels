'use client';

import React from 'react';
import { Film, Zap, CreditCard, LogOut, User, Settings, Sparkles, Plus, Compass, DollarSign, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavbarProps {
  creditBalance: number;
  userTier?: 'free' | 'pro' | 'max';
  onBuyCreditsClick?: () => void;
}

export function Navbar({ creditBalance, userTier = 'free', onBuyCreditsClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = React.useState('creator@openreel.ai');
  const [displayName, setDisplayName] = React.useState('Creator Account');
  const [avatarUrl, setAvatarUrl] = React.useState('');

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'creator@openreel.ai');
        
        // Fetch display name / avatar from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setDisplayName(profile.display_name || user.email?.split('@')[0] || 'Creator Account');
          setAvatarUrl(profile.avatar_url || '');
        } else {
          setDisplayName(user.email?.split('@')[0] || 'Creator Account');
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity select-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(229,9,20,0.15)]">
              <Film className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-brand-gradient">
                OpenReel
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase -mt-1">
                Studio
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-5">
            <Link 
              href="/studio" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                pathname === '/studio' 
                  ? 'text-primary bg-primary/5 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Studio
            </Link>
            <Link 
              href="/explore" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                pathname === '/explore' 
                  ? 'text-primary bg-primary/5 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Explore
            </Link>
            <Link 
              href="/pricing" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                pathname === '/pricing' 
                  ? 'text-primary bg-primary/5 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Pricing
            </Link>
          </nav>
        </div>

        {/* Center / Right Side: Credits and Profile */}
        <div className="flex items-center gap-4">
          {/* Credit balance display */}
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-1.5 pl-3" />
              }
            >
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span className="text-sm font-semibold text-zinc-200">
                  {creditBalance}
                </span>
                <span className="text-xs text-zinc-500">credits</span>
              </div>
              
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onBuyCreditsClick}
                className="h-7 w-7 rounded-lg bg-zinc-900 hover:bg-primary text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card border border-border text-zinc-200">
              <p>Credits remaining: {creditBalance}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Click + to top up credits</p>
            </TooltipContent>
          </Tooltip>

          {/* User Tier Badge */}
          <Badge 
            variant="outline" 
            className={`capitalize px-2.5 py-0.5 font-medium tracking-wide text-xs ${
              userTier === 'max' 
                ? 'border-red-500/30 bg-primary/10 text-primary' 
                : userTier === 'pro' 
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
            }`}
          >
            {userTier} Tier
          </Badge>

          {/* User Avatar & Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border p-0 hover:ring-2 hover:ring-primary/30 cursor-pointer" />
              }
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-zinc-900 text-zinc-300 font-semibold text-xs">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border border-border text-zinc-200" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-zinc-200">{displayName}</p>
                  <p className="text-xs leading-none text-zinc-500">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2 py-2">
                <User className="h-4 w-4" />
                <span>My Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2 py-2" onClick={onBuyCreditsClick}>
                <CreditCard className="h-4 w-4" />
                <span>Billing & Upgrades</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2 py-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="focus:bg-primary focus:text-white cursor-pointer text-red-400 gap-2 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
