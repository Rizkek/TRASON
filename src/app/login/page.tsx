'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert, Loading } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { sanitizeError, validateEmail } from '@/libs/validation';
import { supabase } from '@/services/supabaseClient';
import { Compass, ArrowLeft, Quote } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [loginProgress, setLoginProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated (skip if still loading)
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-warm-black flex items-center justify-center">
        <Loading text="Authenticating..." />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowProgress(true);
    setLoginProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setLoginProgress(p => p >= 90 ? 90 : p + Math.floor(Math.random() * 15) + 5);
    }, 100);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw new Error(signInError.message);
      if (!data.session) throw new Error('No session created');
      
      clearInterval(interval);
      setLoginProgress(100);
      
      // Delay slightly so user sees 100% before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (err) {
      clearInterval(interval);
      setShowProgress(false);
      setError(sanitizeError(err));
      setIsLoading(false);
    }
  };

  if (showProgress) {
    return (
      <div className="fixed inset-0 z-[100] bg-warm-black flex flex-col items-center justify-center font-sans overflow-hidden transition-opacity duration-700">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-warm-gold/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-warm-gold/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        
        <div className="relative w-24 h-24 mb-2xl">
          <div className="absolute inset-0 bg-warm-gold/20 rotate-45 blur-xl animate-pulse" />
          <div className="absolute inset-0 border border-warm-gold rotate-45 flex items-center justify-center bg-warm-black/50 backdrop-blur-sm">
            <span className="text-3xl font-serif text-warm-gold -rotate-45">T</span>
          </div>
        </div>

        <div className="text-center space-y-md z-10">
          <div className="text-display font-light text-soft-cream font-serif tracking-tighter">
            {loginProgress}%
          </div>
          <p className="text-micro tracking-[0.4em] uppercase text-warm-gold">Authenticating</p>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-warm-gold transition-all duration-100 ease-out" style={{ width: `${loginProgress}%` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-black flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Aesthetic/Quote (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gray-strong relative items-center justify-center p-4xl overflow-hidden border-r border-white/[0.05]">
         {/* Decorative elements */}
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-deep-sage/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-warm-gold/5 blur-[80px] rounded-full" />
         
         <div className="relative z-10 max-w-md space-y-xl animate-fade-in">
            <Quote size={48} className="text-warm-gold opacity-40 mb-lg" />
            <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight text-soft-cream/90">
              "The only journey is the one within."
            </h2>
            <div className="space-y-sm">
              <p className="text-lg font-medium text-warm-gold">— Rainer Maria Rilke</p>
              <p className="text-sm text-gray-light font-light leading-relaxed">
                Continue your path to clarity and growth. Your digital living space is ready for your return.
              </p>
            </div>
         </div>

         {/* Bottom Brand Label */}
         <div className="absolute bottom-12 left-12 flex items-center gap-sm opacity-40">
            <Compass size={20} />
            <span className="font-serif text-lg tracking-tight">TRASON</span>
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-lg md:p-4xl relative">
        <Link href="/" className="absolute top-12 left-12 flex items-center gap-sm text-micro uppercase tracking-widest text-gray-light hover:text-warm-gold transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-sm space-y-2xl animate-slide-up">
          <div className="space-y-sm text-center md:text-left">
            <h1 className="text-3xl font-serif">Welcome Back</h1>
            <p className="text-sm text-gray-light font-light">Enter your credentials to access your sanctuary.</p>
          </div>

          {error && (
            <Alert type="error" title="Sign In Error" className="bg-expense/10 border-expense/20 text-expense">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-xl">
            <div className="space-y-lg">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold transition-all"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold transition-all"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              className="py-lg rounded-full font-bold shadow-xl shadow-warm-gold/10"
            >
              Enter TRASON
            </Button>
          </form>

          <div className="text-center md:text-left">
            <p className="text-sm text-gray-light font-light">
              New to the journey?{' '}
              <Link href="/signup" className="text-warm-gold hover:underline font-medium underline-offset-4 decoration-warm-gold/30">
                Begin here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
