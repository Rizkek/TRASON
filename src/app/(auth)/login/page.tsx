'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordToggle } from '@/components/auth/PasswordToggle';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { sanitizeError, validateEmail } from '@/libs/validation';
import { supabase } from '@/services/supabase/supabaseClient';

function AuthStatus({ text }: { text: string }) {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center bg-background text-body-md text-muted-foreground">
      {text}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [authLoading, isAuthenticated, router, redirectTo]);

  if (authLoading) return <AuthStatus text={t('auth.authenticating')} />;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    if (!formData.password) errors.password = t('auth.password_required');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
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
    <AuthShell quote={t('auth.login_quote')} description={t('auth.login_panel_desc')} busy={isLoading}>
      <div className="space-y-2">
        <Heading as="h1" size="h2">
          {t('auth.loginTitle')}
        </Heading>
        <Paragraph className="text-body-md text-muted-foreground">{t('auth.loginSubtitle')}</Paragraph>
      </div>

      {error && (
        <Alert type="error" title={t('auth.login_error_title')} onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          label={t('auth.email_address')}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t('auth.email_ph')}
          value={formData.email}
          onChange={handleInputChange}
          error={validationErrors.email}
          required
        />
        <Input
          label={t('auth.password')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="********"
          value={formData.password}
          onChange={handleInputChange}
          error={validationErrors.password}
          required
          suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} loadingText={t('auth.authenticating')} className="rounded-full">
          {t('auth.open_dashboard')}
        </Button>
      </form>

      <Paragraph className="text-center text-body-md text-muted-foreground md:text-left">
        {t('auth.new_to_trason')}{' '}
        <Link href="/signup" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.begin_here')}
        </Link>
      </Paragraph>
    </AuthShell>
  );
}

function LoginFallback() {
  const { t } = useTranslation();
  return <AuthStatus text={t('common.loading')} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
