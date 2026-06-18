'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert, Logo } from '@/components';
import { supabase } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { validateEmail, validatePassword, sanitizeError } from '@/libs/validation';
import { Compass, ArrowLeft, Sparkles, CheckCircle, AlertTriangle, Loader2, XCircle, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email domain check state
  const [emailDomainStatus, setEmailDomainStatus] = useState<
    null | 'checking' | 'valid' | 'warning' | 'invalid'
  >(null);
  const [emailDomainMessage, setEmailDomainMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset domain status when email changes
    if (name === 'email') {
      setEmailDomainStatus(null);
      setEmailDomainMessage(null);
    }
  };

  const checkEmailDomain = async (email: string) => {
    // Only check if basic format is valid
    const formatError = validateEmail(email);
    if (formatError) return;

    setEmailDomainStatus('checking');
    setEmailDomainMessage(null);
    try {
      const res = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.valid) {
        setEmailDomainStatus('invalid');
        setEmailDomainMessage(data.reason || 'This email domain does not exist');
      } else if (data.warning) {
        setEmailDomainStatus('warning');
        setEmailDomainMessage(data.warning);
      } else {
        setEmailDomainStatus('valid');
        setEmailDomainMessage(null);
      }
    } catch {
      // Network error â€” don't block the user
      setEmailDomainStatus(null);
    }
  };

  const handleEmailBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkEmailDomain(formData.email), 300);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    } else if (emailDomainStatus === 'invalid') {
      errors.email = emailDomainMessage || 'Email domain is invalid';
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

  const getSignUpErrorMessage = (signUpError: any): string => {
    const message = signUpError?.message ?? 'Unable to register';
    if (signUpError?.status === 500) {
      return 'Server error while registering. Check Supabase logs or try again later.';
    }
    if (
      signUpError?.status === 409 ||
      signUpError?.code === 'DUPLICATE' ||
      /duplicate|already exists|users_email_key|email.*exists/i.test(message)
    ) {
      return 'That email is already registered. If you deleted the account, make sure the Supabase Auth user record is fully removed before signing up again.';
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);

    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
      const lastName = lastNameParts.join(' ');
      const email = formData.email.trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });

       if (signUpError) {
        console.error('Supabase signUp error:', signUpError);
        setError(getSignUpErrorMessage(signUpError));
        setIsLoading(false);
        return;
      }
      if (data.user) {
        if (data.session) {
          await userQueries.ensureUserProfile();
          router.push('/onboarding');
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
      <div className="hidden md:flex md:w-1/2 bg-gray-strong relative items-center justify-center p-4xl overflow-hidden border-r border-black/[0.05] dark:border-white/[0.05]">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-deep-sage/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-warm-gold/5 blur-[80px] rounded-full" />
         
         <div className="relative z-10 max-w-md space-y-xl animate-fade-in">
            <Sparkles size={48} className="text-warm-gold opacity-40 mb-lg" />
            <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight text-soft-cream/90">
              "Build the system, then let the system carry you."
            </h2>
            <div className="space-y-sm">
              <p className="text-lg font-medium text-warm-gold">TRASON</p>
              <p className="text-sm text-gray-light font-light leading-relaxed">
                Start with one private workspace for your money, habits, workouts, reminders, and long-term direction.
              </p>
            </div>
         </div>

         <div className="absolute bottom-12 left-12 flex items-center gap-sm opacity-40">
            <Logo size={40} variant="gold" />
            <span className="font-serif text-lg tracking-tight">TRASON</span>
         </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-lg md:p-4xl relative overflow-y-auto">
        {isLoading && <div className="absolute top-0 left-0 right-0 h-1 bg-warm-gold animate-pulse" />}
        <Link href="/" className="absolute top-12 z-10 left-16 flex items-center gap-sm text-micro uppercase tracking-widest text-gray-light hover:text-warm-gold transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-sm space-y-xl animate-slide-up py-5xl">
          <div className="space-y-sm text-center md:text-left">
            <h1 className="text-3xl font-serif">Create Your Personal OS</h1>
            <p className="text-sm text-gray-light font-light">Set up a calm place to capture the day and understand your momentum.</p>
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
              className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold"
              required
            />
            <div className="relative">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                error={validationErrors.email}
                className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold"
                required
              />
              {/* Domain validation indicator */}
              {formData.email && !validationErrors.email && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {emailDomainStatus === 'checking' && (
                    <>
                      <Loader2 size={12} className="text-gray-light animate-spin" />
                      <span className="text-[10px] text-gray-light">Verifying email domain...</span>
                    </>
                  )}
                  {emailDomainStatus === 'valid' && (
                    <>
                      <CheckCircle size={12} className="text-success" />
                      <span className="text-[10px] text-success">Email domain verified</span>
                    </>
                  )}
                  {emailDomainStatus === 'warning' && (
                    <>
                      <AlertTriangle size={12} className="text-primary" />
                      <span className="text-[10px] text-primary">{emailDomainMessage}</span>
                    </>
                  )}
                  {emailDomainStatus === 'invalid' && (
                    <>
                      <XCircle size={12} className="text-danger" />
                      <span className="text-[10px] text-danger">{emailDomainMessage}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold"
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
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={validationErrors.confirmPassword}
              className="bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] focus:border-warm-gold"
              required
              suffix={
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:text-white transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              className="py-lg rounded-full font-bold shadow-xl shadow-warm-gold/10 mt-xl"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center md:text-left">
            <p className="text-sm text-gray-light font-light">
              Already have your workspace?{' '}
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
