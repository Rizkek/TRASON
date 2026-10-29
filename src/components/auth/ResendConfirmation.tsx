'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { authErrorKey } from '@/libs/authErrors';
import { authConfirmUrl } from '@/libs/authRedirect';
import { supabase } from '@/services/supabase/supabaseClient';
import type { useCaptcha } from './Turnstile';

// Matches Supabase's default limit of one auth email per address per 60 seconds.
const RESEND_COOLDOWN_S = 60;

interface ResendConfirmationProps {
  email: string;
  captcha: ReturnType<typeof useCaptcha>;
  /** Start in cooldown when an email was sent a moment ago (right after signup). */
  justSent?: boolean;
}

export function ResendConfirmation({ email, captcha, justSent = false }: ResendConfirmationProps) {
  const { t } = useTranslation();
  const [cooldown, setCooldown] = useState(justSent ? RESEND_COOLDOWN_S : 0);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!captcha.ready) {
      setResult({ ok: false, message: t('auth.captcha_required') });
      return;
    }
    setIsSending(true);
    setResult(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: authConfirmUrl(window.location.origin, '/onboarding'),
        captchaToken: captcha.token ?? undefined,
      },
    });
    captcha.reset();
    setIsSending(false);
    if (error) {
      setResult({ ok: false, message: t(`auth.errors.${authErrorKey(error)}`) });
      return;
    }
    setResult({ ok: true, message: t('auth.resent') });
    setCooldown(RESEND_COOLDOWN_S);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="md"
        fullWidth
        onClick={handleResend}
        disabled={cooldown > 0}
        isLoading={isSending}
        loadingText={t('auth.sending')}
      >
        {cooldown > 0 ? t('auth.resend_in').replace('{s}', String(cooldown)) : t('auth.resend_email')}
      </Button>
      {result && (
        <p role={result.ok ? 'status' : 'alert'} className={`text-body-sm ${result.ok ? 'text-success' : 'text-danger'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
