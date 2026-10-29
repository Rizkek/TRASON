'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordToggle } from '@/components/auth/PasswordToggle';
import { PasswordRules } from '@/components/auth/PasswordRules';
import { useFocusFirstInvalid } from '@/components/auth/useFocusFirstInvalid';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { failedPasswordRules } from '@/libs/validation';
import { authErrorKey, type AuthErrorKey } from '@/libs/authErrors';
import { supabase } from '@/services/supabase/supabaseClient';

type Field = 'password' | 'confirmPassword';

const LINK_CLASS = 'inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline';

/**
 * Reached through /auth/confirm, which turns the emailed recovery link into a session.
 * Without that session there is nothing to update, so the page offers a new link instead.
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const formRef = useRef<HTMLFormElement>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);

  const [formData, setFormData] = useState<Record<Field, string>>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [invalidAttempt, setInvalidAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  useFocusFirstInvalid(formRef, invalidAttempt);

  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  const shell = (children: React.ReactNode, busy = false) => (
    <AuthShell quote={t('auth.login_quote')} description={t('auth.login_panel_desc')} busy={busy}>
      {children}
    </AuthShell>
  );

  if (!isAuthReady) {
    return shell(
      <p role="status" className="text-body-md text-muted-foreground">
        {t('auth.checking_link')}
      </p>
    );
  }

  if (done) {
    return shell(
      <>
        <div className="space-y-3">
          <Heading as="h1" size="h2" ref={doneHeadingRef} tabIndex={-1} className="outline-none">
            {t('auth.reset_done_title')}
          </Heading>
          <Paragraph className="text-body-md text-muted-foreground">{t('auth.reset_done_desc')}</Paragraph>
        </div>
        <Button type="button" variant="primary" size="lg" fullWidth className="rounded-full" onClick={() => router.replace('/dashboard')}>
          {t('auth.open_dashboard')}
        </Button>
      </>
    );
  }

  if (!isAuthenticated || formError === 'session_missing') {
    return shell(
      <>
        <div className="space-y-3">
          <Heading as="h1" size="h2">
            {t('auth.reset_expired_title')}
          </Heading>
          <Paragraph className="text-body-md text-muted-foreground">{t('auth.reset_expired_desc')}</Paragraph>
        </div>
        <Paragraph className="text-body-md">
          <Link href="/forgot-password" className={LINK_CLASS}>
            {t('auth.request_new_link')}
          </Link>
        </Paragraph>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: Partial<Record<Field, string>> = {};
    if (failedPasswordRules(formData.password).length > 0) next.password = t('auth.password_invalid');
    if (formData.password !== formData.confirmPassword) next.confirmPassword = t('auth.passwords_mismatch');
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setInvalidAttempt((n) => n + 1);
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: formData.password });
    if (error) {
      const key = authErrorKey(error);
      if (key === 'weak_password' || key === 'same_password') {
        setErrors({ password: t(`auth.errors.${key}`) });
        setInvalidAttempt((n) => n + 1);
      } else {
        setFormError(key);
      }
      setIsLoading(false);
      return;
    }

    // Whoever triggered the reset may not be the only one holding a session; end the others.
    await supabase.auth.signOut({ scope: 'others' }).catch(() => null);
    setIsLoading(false);
    setDone(true);
  };

  return shell(
    <>
      <div className="space-y-2">
        <Heading as="h1" size="h2">
          {t('auth.reset_title')}
        </Heading>
        <Paragraph className="text-body-md text-muted-foreground">{t('auth.reset_lede')}</Paragraph>
      </div>

      {formError && (
        <Alert type="error" title={t('auth.reset_error_title')} onDismiss={() => setFormError(null)}>
          {t(`auth.errors.${formError}`)}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Input
            label={t('auth.new_password')}
            id="reset-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            aria-describedby={errors.password ? 'reset-password-error password-rules' : 'password-rules'}
            required
            suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          <PasswordRules id="password-rules" password={formData.password} />
        </div>
        <Input
          label={t('auth.confirm_password')}
          id="reset-confirm-password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} loadingText={t('auth.saving')} className="rounded-full">
          {t('auth.save_password')}
        </Button>
      </form>
    </>,
    isLoading
  );
}
