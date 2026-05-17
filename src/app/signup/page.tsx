'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { supabase } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { validateEmail, validatePassword, sanitizeError } from '@/libs/validation';
import { Compass, ArrowLeft, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
      const lastName = lastNameParts.join(' ');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });

      if (signUpError) throw new Error(signUpError.message);
      if (data.user) {
        if (data.session) {
          await userQueries.ensureUserProfile();
          router.push('/dashboard');
        } else {
          setError('Success! Please check your email to confirm your account.');
          setTimeout(() => router.push('/login'), 3000);
        }
      }
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-black flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Aesthetic (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gray-strong relative items-center justify-center p-4xl overflow-hidden border-r border-white/[0.05]">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-deep-sage/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-warm-gold/5 blur-[80px] rounded-full" />
         
         <div className="relative z-10 max-w-md space-y-xl animate-fade-in">
            <Sparkles size={48} className="text-warm-gold opacity-40 mb-lg" />
            <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight text-soft-cream/90">
              "Growth is the only evidence of life."
            </h2>
            <div className="space-y-sm">
              <p className="text-lg font-medium text-warm-gold">— John Henry Newman</p>
              <p className="text-sm text-gray-light font-light leading-relaxed">
                Take the first step toward a more intentional life. TRASON helps you bridge the gap between who you are and who you want to be.
              </p>
            </div>
         </div>

         <div className="absolute bottom-12 left-12 flex items-center gap-sm opacity-40">
            <Compass size={20} />
            <span className="font-serif text-lg tracking-tight">TRASON</span>
         </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-lg md:p-4xl relative overflow-y-auto">
        <Link href="/" className="absolute top-12 left-12 flex items-center gap-sm text-micro uppercase tracking-widest text-gray-light hover:text-warm-gold transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-sm space-y-2xl animate-slide-up py-4xl">
          <div className="space-y-sm text-center md:text-left">
            <h1 className="text-3xl font-serif">Begin Your Journey</h1>
            <p className="text-sm text-gray-light font-light">Create your personal sanctuary in just a few steps.</p>
          </div>

          {error && (
            <Alert 
              type={error.includes('Success') ? 'success' : 'error'} 
              title={error.includes('Success') ? 'Account Created' : 'Unable to Register'}
              className={error.includes('Success') ? 'bg-income/10 border-income/20 text-income' : 'bg-expense/10 border-expense/20 text-expense'}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              error={validationErrors.name}
              className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold"
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={validationErrors.email}
              className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold"
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={validationErrors.confirmPassword}
              className="bg-white/[0.03] border-white/[0.08] focus:border-warm-gold"
              required
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              className="py-lg rounded-full font-bold shadow-xl shadow-warm-gold/10 mt-xl"
            >
              Start Journey
            </Button>
          </form>

          <div className="text-center md:text-left">
            <p className="text-sm text-gray-light font-light">
              Already walking with us?{' '}
              <Link href="/login" className="text-warm-gold hover:underline font-medium underline-offset-4 decoration-warm-gold/30">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
