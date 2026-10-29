'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { useCaptcha } from '@/components/auth/Turnstile';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { getEmailIssue } from '@/libs/validation';
import { authErrorKey, type AuthErrorKey } from '@/libs/authErrors';
import { authConfirmUrl } from '@/libs/authRedirect';
import { supabase } from '@/services/supabase/supabaseClient';

type FormError = AuthErrorKey | 'captcha_required';

const LINK_CLASS = 'inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline';

function ForgotPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const captcha = useCaptcha();
  const emailRef = useRef<HTMLInputElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(
    searchParams.get('auth_error') === 'link_invalid' ? 'link_invalid' : null
  );
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (sentTo) sentHeadingRef.current?.focus();
  }, [sentTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const issue = getEmailIssue(email);
    if (issue) {
      setEmailError(t(`auth.errors.email_${issue}`));
      emailRef.current?.focus();
      return;
    }
    if (!captcha.ready) {
      setFormError('captcha_required');
      return;
    }

    setIsLoading(true);
    const address = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: authConfirmUrl(window.location.origin, '/reset-password'),
      captchaToken: captcha.token ?? undefined,
    });
    captcha.reset();
    setIsLoading(false);

    // Supabase answers the same way whether or not the address has an account,
    // so the confirmation below reveals nothing about which emails are registered.
    if (error) setFormError(authErrorKey(error));
    else setSentTo(address);
  };

  if (sentTo) {
    return (
      <AuthShell quote={t('auth.login_quote')} description={t('auth.login_panel_desc')}>
        <div className="space-y-3">
          <Heading as="h1" size="h2" ref={sentHeadingRef} tabIndex={-1} className="outline-none">
            {t('auth.reset_sent_title')}
          </Heading>
          <Paragraph className="text-body-md text-muted-foreground">{t('auth.reset_sent_desc').replace('{email}', sentTo)}</Paragraph>
          <Paragraph className="text-body-sm text-muted-foreground">{t('auth.check_inbox_hint')}</Paragraph>
        </div>
        <Button type="button" variant="outline" size="md" fullWidth onClick={() => setSentTo(null)}>
          {t('auth.use_different_email')}
        </Button>
        <Paragraph className="text-center text-body-md md:text-left">
          <Link href="/login" className={LINK_CLASS}>
            {t('auth.back_to_login')}
          </Link>
        </Paragraph>
      </AuthShell>
    );
  }

  return (
    <AuthShell quote={t('auth.login_quote')} description={t('auth.login_panel_desc')} busy={isLoading}>
      <div className="space-y-2">
        <Heading as="h1" size="h2">
          {t('auth.forgot_title')}
        </Heading>
        <Paragraph className="text-body-md text-muted-foreground">{t('auth.forgot_lede')}</Paragraph>
      </div>

      {formError && (
        <Alert type="error" title={t('auth.reset_error_title')} onDismiss={() => setFormError(null)}>
          {formError === 'captcha_required' ? t('auth.captcha_required') : t(`auth.errors.${formError}`)}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          ref={emailRef}
          label={t('auth.email_address')}
          id="forgot-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t('auth.email_ph')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(undefined);
          }}
          error={emailError}
          required
        />

        {captcha.widget}

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} loadingText={t('auth.sending')} className="rounded-full">
          {t('auth.send_reset_link')}
        </Button>
      </form>

      <Paragraph className="text-center text-body-md md:text-left">
        <Link href="/login" className={LINK_CLASS}>
          {t('auth.back_to_login')}
        </Link>
      </Paragraph>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
