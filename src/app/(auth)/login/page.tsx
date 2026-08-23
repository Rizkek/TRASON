'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert, Loading, Logo } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { sanitizeError, validateEmail } from '@/libs/validation';
import { supabase } from '@/services/supabase/supabaseClient';
import { Compass, ArrowLeft, Quotes, Eye, EyeSlash as EyeOff } from '@phosphor-icons/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { isOnboarded } = useUserPreferences();

  useEffect(() => {
    // Redirect if already authenticated (skip if still loading)
    if (!authLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [authLoading, isAuthenticated, router, redirectTo]);

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
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const email = formData.email.trim();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (signInError) throw new Error(signInError.message);
      if (!data.session) throw new Error('No session created');

      router.push(redirectTo);
    } catch (err) {
      setError(sanitizeError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-black flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Aesthetic/Quotes (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gray-strong relative items-center justify-center p-24 overflow-hidden border-r border-black/[0.05] dark:border-white/[0.05]">
         {/* Decorative elements */}
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-deep-sage/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-warm-gold/5 blur-[80px] rounded-full" />
         
         <div className="relative z-10 max-w-md space-y-8 animate-fade-in">
            <Quotes size={48} className="text-warm-gold opacity-40 mb-6" />
            <Heading as="h2" size="h2" className="italic text-soft-cream/90">
              "Return to the signal. Leave the noise outside."
            </Heading>
            <div className="space-y-2">
              <Paragraph size="lg" className="font-medium text-warm-gold">TRASON</Paragraph>
              <Paragraph size="sm">
                Your dashboard is ready to show what matters next: money, movement, reminders, and momentum.
              </Paragraph>
            </div>
         </div>

         {/* Bottom Brand Label */}
         <div className="absolute bottom-12 left-12 flex items-center gap-2 opacity-40">
            <Logo size={32} variant="gold" />
            <span className="font-serif text-lg tracking-tight">TRASON</span>
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-24 relative">
        {isLoading && <div className="absolute top-0 left-0 right-0 h-1 bg-warm-gold animate-pulse" />}
        <Link href="/" className="absolute top-12 left-16 flex items-center gap-2 text-micro uppercase tracking-widest text-gray-light hover:text-warm-gold transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <div className="space-y-2 text-center md:text-left">
            <Heading as="h1" size="h3">Welcome Back</Heading>
            <Paragraph size="sm">Sign in to continue where your last signal left off.</Paragraph>
          </div>

          {error && (
            <Alert type="error" title="Sign In Error" className="bg-expense/10 border-expense/20 text-expense">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold transition-all"
                required
              />
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold transition-all"
                required
                suffix={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              className="py-6 rounded-full font-bold shadow-xl shadow-warm-gold/10"
            >
              Open Dashboard
            </Button>
          </form>

          <div className="text-center md:text-left">
            <Paragraph size="sm">
              New to TRASON?{' '}
              <Link href="/signup" className="text-warm-gold hover:underline font-medium underline-offset-4 decoration-warm-gold/30">
                Begin here
              </Link>
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-black flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
