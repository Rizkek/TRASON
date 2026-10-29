'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordToggle } from '@/components/auth/PasswordToggle';
import { ResendConfirmation } from '@/components/auth/ResendConfirmation';
import { useCaptcha } from '@/components/auth/Turnstile';
import { useFocusFirstInvalid } from '@/components/auth/useFocusFirstInvalid';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { getEmailIssue } from '@/libs/validation';
import { authErrorKey, type AuthErrorKey } from '@/libs/authErrors';
import { safeRedirectPath } from '@/libs/authRedirect';
import { supabase } from '@/services/supabase/supabaseClient';

type Field = 'email' | 'password';
type FormError = AuthErrorKey | 'captcha_required';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get('redirect_to'));
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<Record<Field, string>>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [invalidAttempt, setInvalidAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(
    searchParams.get('auth_error') === 'link_invalid' ? 'link_invalid' : null
  );
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useFocusFirstInvalid(formRef, invalidAttempt);

  // Middleware already redirects signed-in visitors; this covers a session that appears
  // client-side (another tab signs in). isAuthReady guards against a stale persisted flag.
  useEffect(() => {
    if (isAuthReady && isAuthenticated) router.replace(redirectTo);
  }, [isAuthReady, isAuthenticated, router, redirectTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const next: Partial<Record<Field, string>> = {};
    const emailIssue = getEmailIssue(formData.email);
    if (emailIssue) next.email = t(`auth.errors.email_${emailIssue}`);
    if (!formData.password) next.password = t('auth.password_required');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setUnconfirmedEmail(null);
    if (!validateForm()) {
      setInvalidAttempt((n) => n + 1);
      return;
    }
    if (!captcha.ready) {
      setFormError('captcha_required');
      return;
    }

    setIsLoading(true);
    const email = formData.email.trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
        options: { captchaToken: captcha.token ?? undefined },
      });
      if (error || !data.session) {
        const key = error ? authErrorKey(error) : 'unknown';
        if (key === 'email_not_confirmed') setUnconfirmedEmail(email);
        setFormError(key);
        setIsLoading(false);
        captcha.reset();
        return;
      }
      router.replace(redirectTo);
    } catch (err) {
      setFormError(authErrorKey(err));
      setIsLoading(false);
      captcha.reset();
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

      {formError && (
        <Alert type="error" title={t('auth.login_error_title')} onDismiss={() => setFormError(null)}>
          {formError === 'captcha_required' ? t('auth.captcha_required') : t(`auth.errors.${formError}`)}
          {formError === 'link_invalid' && (
            <Link href="/forgot-password" className="mt-2 inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
              {t('auth.request_new_link')}
            </Link>
          )}
          {unconfirmedEmail && (
            <div className="mt-3">
              <ResendConfirmation email={unconfirmedEmail} captcha={captcha} />
            </div>
          )}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label={t('auth.email_address')}
          id="login-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t('auth.email_ph')}
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />
        <div>
          <Input
            label={t('auth.password')}
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
            suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center text-body-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('auth.forgot_password_link')}
            </Link>
          </div>
        </div>

        {captcha.widget}

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
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center bg-background text-body-md text-muted-foreground">
      {t('common.loading')}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
