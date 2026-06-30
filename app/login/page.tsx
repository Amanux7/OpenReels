'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

// Custom inline SVG icons to prevent older lucide-react export issues
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props} fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props} fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error(`Supabase OAuth error with ${provider}:`, err);
      setLoadingProvider(null);
      alert(`Authentication failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      router.push('/studio');
    } catch (err: any) {
      console.error('Email login failed:', err);
      alert(`Login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      alert("Please fill in both email and password fields.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw error;
      }
      // If user is immediately logged in or requires email verification
      if (data.session) {
        alert("Registration successful! Logging you in...");
        router.push('/studio');
      } else {
        alert("Registration successful! Please check your inbox for a verification link.");
      }
    } catch (err: any) {
      console.error('Email sign up failed:', err);
      alert(`Sign up failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#141414] overflow-hidden font-sans">
      
      {/* Blurred Zooming Background Simulation */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/mock-generations/cyberpunk_city.png" 
          alt="Login background theme" 
          className="w-full h-full object-cover blur-xl scale-110 opacity-40 animate-pulse duration-[8000ms]"
        />
        {/* Dark Radial Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(20,20,20,0.9)_80%)]" />
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Floating Brand Icon */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_20px_rgba(229,9,20,0.2)] mb-3">
            <Film className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight text-brand-gradient">
            OpenReel
          </h2>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
            Generative AI Studio
          </span>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#2f2f2f] bg-[#181818]/90 p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Subtle top indicator glow */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />

          <h3 className="text-xl font-bold text-[#f5f5f1] text-center mb-1 uppercase font-display">
            Welcome to OpenReel
          </h3>
          <p className="text-zinc-550 text-xs text-center mb-8 font-semibold">
            Create high-fidelity cinematic outputs instantly.
          </p>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-[#2f2f2f] bg-transparent text-zinc-200 text-xs focus:border-primary focus:outline-none transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl border border-[#2f2f2f] bg-transparent text-zinc-200 text-xs focus:border-primary focus:outline-none transition-colors duration-200"
              />
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 brand-gradient text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleEmailSignUp}
                className="flex-1 h-11 border border-[#2f2f2f] bg-transparent hover:bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors duration-200"
              >
                Sign Up
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2f2f2f]"></div>
            </div>
            <span className="relative px-3 bg-[#181818] text-[10px] text-zinc-500 font-bold uppercase">Or continue with</span>
          </div>

          <div className="space-y-4">
            {/* Google Login Button */}
            <Button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => handleLogin('google')}
              className="w-full h-11 border border-[#2f2f2f] bg-transparent hover:bg-zinc-900 hover:border-zinc-500 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
            >
              {loadingProvider === 'google' ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            {/* GitHub Login Button */}
            <Button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => handleLogin('github')}
              className="w-full h-11 border border-[#2f2f2f] bg-transparent hover:bg-zinc-900 hover:border-zinc-500 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
            >
              {loadingProvider === 'github' ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                  <span>Connecting to GitHub...</span>
                </div>
              ) : (
                <>
                  <GithubIcon className="h-4 w-4 text-zinc-350 shrink-0" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </Button>
          </div>

          {/* Footer Terms */}
          <div className="mt-8 text-center text-[10px] text-zinc-600 font-semibold leading-relaxed">
            By signing in, you agree to our{' '}
            <span className="text-zinc-500 hover:underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-zinc-500 hover:underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>

        {/* Quick Helper badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-bold uppercase tracking-wider select-none">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>New users receive 50 free credits</span>
        </div>
      </div>
    </div>
  );
}
