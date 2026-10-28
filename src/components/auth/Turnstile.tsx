'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Bot check for auth forms. Supabase verifies the token server-side once CAPTCHA is enabled
 * in the project's Auth settings; without a site key the widget is skipped entirely.
 * Tokens are single-use, so call `reset()` after every request that consumed one.
 */
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setResetSignal((n) => n + 1);
  }, []);

  return {
    enabled: Boolean(SITE_KEY),
    token,
    /** True when the request may proceed: CAPTCHA is off, or a token is ready. */
    ready: !SITE_KEY || Boolean(token),
    reset,
    widget: SITE_KEY ? <TurnstileWidget onToken={setToken} resetSignal={resetSignal} /> : null,
  };
}

function TurnstileWidget({ onToken, resetSignal }: { onToken: (token: string | null) => void; resetSignal: number }) {
  const { t } = useTranslation();
  const theme = useResolvedTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme,
          size: 'flexible',
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        });
      })
      .catch(() => !cancelled && setLoadFailed(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [theme, onToken]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  if (loadFailed) {
    return (
      <p role="alert" className="text-body-sm text-danger">
        {t('auth.captcha_load_failed')}
      </p>
    );
  }

  return <div ref={containerRef} className="min-h-16 w-full" />;
}
