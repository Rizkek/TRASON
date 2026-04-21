'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert, Card } from '@/components';
import { supabase } from '@/services/supabaseClient';
import { validatePassword } from '@/libs/helpers';
import { getAuthErrorMessage } from '@/libs/authErrors';

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

    if (!formData.name) {
      errors.name = 'Name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.name.split(' ')[0],
            last_name: formData.name.split(' ').slice(1).join(' ') || '',
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.user) {
        // Create user profile in public database
        // Use upsert to avoid conflicts if profile already exists
        try {
          const { error: insertError, status } = await supabase
            .from('users')
            .upsert(
              [
                {
                  id: data.user.id,
                  email: formData.email,
                  first_name: formData.name.split(' ')[0],
                  last_name: formData.name.split(' ').slice(1).join(' ') || '',
                  email_verified: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              { onConflict: 'id' }
            );

          if (insertError) {
            console.error('User profile creation error:', {
              error: insertError,
              message: insertError.message,
              status: status,
              code: insertError.code,
              details: insertError.details,
            });
            // Profile creation failed but auth user exists - that's OK
            // User can still login, profile will be created on first login
            console.warn('Profile creation failed but signup successful. User can still login.');
          } else {
            console.log('User profile created successfully');
          }
        } catch (profileError) {
          console.error('Unexpected error during profile creation:', profileError);
          // Not a fatal error - user auth still exists
        }

        // Check if email confirmation is required
        if (data.session) {
          // No email confirmation needed - user is already logged in
          router.push('/dashboard');
        } else if (data.user.identities && data.user.identities.length === 0) {
          // User exists but needs email verification
          setError('Account created! Please check your email to verify your account.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          // Standard email confirmation required
          setError('Account created! Check your email to confirm your account.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-black flex items-center justify-center p-md">
      <Card className="w-full max-w-sm border-warm-gold border-opacity-20 hover:border-opacity-40">
        <div className="text-center mb-2xl">
          <h1 className="text-display font-serif text-warm-gold mb-md">
            TRASON
          </h1>
          <p className="text-subtext">Create your account and start your journey</p>
        </div>

        {error && (
          <Alert 
            type={error.includes('created') ? 'success' : 'error'} 
            title={error.includes('created') ? 'Success!' : 'Unable to Create Account'} 
            dismissible 
            className="mb-lg"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            error={validationErrors.name}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            error={validationErrors.email}
            required
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              helpText="Min 8 chars: uppercase, lowercase, number, special char"
              required
            />
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={validationErrors.confirmPassword}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} loadingText="Creating account...">
            Create Account
          </Button>
        </form>

        <div className="mt-2xl text-center text-micro text-gray-light">
          Already have an account?{' '}
          <Link href="/login" className="text-warm-gold hover:text-pale-blush font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
