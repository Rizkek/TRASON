'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert, Card } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncOperation } from '@/hooks/useFetch';
import { apiClient } from '@/services/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuth();
  const { execute, isLoading, error } = useAsyncOperation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await execute(async () => {
      const response = await apiClient.post('/auth/login', formData);

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update Zustand store
      setTokens(accessToken, refreshToken);
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
    });
  };

  return (
    <div className="min-h-screen bg-warm-black flex items-center justify-center p-md">
      <Card className="w-full max-w-sm border-warm-gold border-opacity-20 hover:border-opacity-40">
        <div className="text-center mb-2xl">
          <h1 className="text-display font-serif text-warm-gold mb-md">
            TRASON
          </h1>
          <p className="text-subtext">Your personal self-improvement journey begins here</p>
        </div>

        {error && (
          <Alert type="error" title="Unable to Sign In" dismissible className="mb-lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
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

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            error={validationErrors.password}
            required
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-2xl text-center text-micro text-gray-light">
          Don't have an account?{' '}
          <Link href="/signup" className="text-warm-gold hover:text-pale-blush font-semibold transition-colors">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}
