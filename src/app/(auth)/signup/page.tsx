'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordToggle } from '@/components/auth/PasswordToggle';
import { PasswordRules } from '@/components/auth/PasswordRules';
import { ResendConfirmation } from '@/components/auth/ResendConfirmation';
import { useCaptcha } from '@/components/auth/Turnstile';
import { useFocusFirstInvalid } from '@/components/auth/useFocusFirstInvalid';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { supabase } from '@/services/supabase/supabaseClient';
import { userQueries } from '@/services/core/userQueries';
import { failedPasswordRules, getEmailIssue } from '@/libs/validation';
import { authErrorKey, type AuthErrorKey } from '@/libs/authErrors';
import { authConfirmUrl } from '@/libs/authRedirect';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';
type DomainCode = 'invalid' | 'disposable' | 'no_domain' | 'no_mx' | 'unverified';
type DomainCheck =
  | { status: 'checking' }
  | { status: 'valid' }
  | { status: 'warning' | 'invalid'; code: DomainCode }
  | null;
type FormError = AuthErrorKey | 'captcha_required';

const LINK_CLASS = 'font-medium text-primary underline underline-offset-4';

/** Replaces `{token}` placeholders in a translated sentence with React nodes, so word order stays per-language. */
function withLinks(template: string, links: Record<string, React.ReactNode>) {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return key && links[key] ? <React.Fragment key={i}>{links[key]}</React.Fragment> : part;
  });
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const captcha = useCaptcha();
  const formRef = useRef<HTMLFormElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  const checkedEmailRef = useRef('');

  const [formData, setFormData] = useState<Record<Field, string>>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [invalidAttempt, setInvalidAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [domain, setDomain] = useState<DomainCheck>(null);

  useFocusFirstInvalid(formRef, invalidAttempt);

  useEffect(() => {
    if (sentTo) sentHeadingRef.current?.focus();
  }, [sentTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === 'email') setDomain(null);
  };

  const checkEmailDomain = async () => {
    const email = formData.email.trim();
    if (getEmailIssue(email)) return;

    checkedEmailRef.current = email;
    setDomain({ status: 'checking' });
    try {
      const res = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data: { valid: boolean; code?: DomainCode } = await res.json();
      // The field may have changed while the lookup was in flight.
      if (checkedEmailRef.current !== email) return;
      if (!data.valid) setDomain({ status: 'invalid', code: data.code ?? 'invalid' });
      else if (data.code) setDomain({ status: 'warning', code: data.code });
      else setDomain({ status: 'valid' });
    } catch {
      // A failed lookup must not block signup.
      setDomain(null);
    }
  };

  const validateForm = (): boolean => {
    const next: Partial<Record<Field, string>> = {};
    if (!formData.name.trim()) next.name = t('auth.name_required');

    const emailIssue = getEmailIssue(formData.email);
    if (emailIssue) next.email = t(`auth.errors.email_${emailIssue}`);
    else if (domain?.status === 'invalid') next.email = t(`auth.domain.${domain.code}`);

    if (failedPasswordRules(formData.password).length > 0) next.password = t('auth.password_invalid');
    if (formData.password !== formData.confirmPassword) next.confirmPassword = t('auth.passwords_mismatch');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) {
      setInvalidAttempt((n) => n + 1);
      return;
    }
    if (!captcha.ready) {
      setFormError('captcha_required');
      return;
    }

    setIsLoading(true);
    let navigating = false;
    try {
      const email = formData.email.trim();
      const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: { first_name: firstName, last_name: lastNameParts.join(' ') },
          emailRedirectTo: authConfirmUrl(window.location.origin, '/onboarding'),
          captchaToken: captcha.token ?? undefined,
        },
      });

      if (error) {
        const key = authErrorKey(error);
        if (key === 'weak_password') {
          setErrors({ password: t('auth.errors.weak_password') });
          setInvalidAttempt((n) => n + 1);
        } else {
          setFormError(key);
        }
        return;
      }

      // With email confirmation on, Supabase answers an existing address with an
      // identity-less user instead of an error, so the duplicate has to be detected here.
      if (data.user && data.user.identities?.length === 0) {
        setFormError('email_taken');
        return;
      }

      if (data.session) {
        // The auth trigger already created the row; this only fills in the name. A failure is
        // retried by getUserWithPreferences on the next load, so it must not block onboarding.
        await userQueries.ensureUserProfile().catch(() => null);
        navigating = true;
        router.replace('/onboarding');
        return;
      }

      setSentTo(email);
    } catch (err) {
      setFormError(authErrorKey(err));
    } finally {
      captcha.reset();
      if (!navigating) setIsLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell quote={t('auth.signup_quote')} description={t('auth.signup_panel_desc')}>
        <div className="space-y-3">
          <Heading as="h1" size="h2" ref={sentHeadingRef} tabIndex={-1} className="outline-none">
            {t('auth.check_inbox_title')}
          </Heading>
          <Paragraph className="text-body-md text-muted-foreground">
            {withLinks(t('auth.check_inbox_desc'), { email: <strong className="text-foreground">{sentTo}</strong> })}
          </Paragraph>
          <Paragraph className="text-body-sm text-muted-foreground">{t('auth.check_inbox_hint')}</Paragraph>
        </div>

        <div className="space-y-4">
          {captcha.widget}
          <ResendConfirmation email={sentTo} captcha={captcha} justSent />
          <Button type="button" variant="ghost" size="md" fullWidth onClick={() => setSentTo(null)}>
            {t('auth.use_different_email')}
          </Button>
        </div>

        <Paragraph className="text-center text-body-md text-muted-foreground md:text-left">
          <Link href="/login" className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}>
            {t('auth.back_to_login')}
          </Link>
        </Paragraph>
      </AuthShell>
    );
  }

  const domainHint = formData.email && !errors.email && domain;

  return (
    <AuthShell quote={t('auth.signup_quote')} description={t('auth.signup_panel_desc')} busy={isLoading}>
      <div className="space-y-2">
        <Heading as="h1" size="h2">
          {t('auth.signup_heading')}
        </Heading>
        <Paragraph className="text-body-md text-muted-foreground">{t('auth.signup_lede')}</Paragraph>
      </div>

      {formError && (
        <Alert type="error" title={t('auth.register_error_title')} onDismiss={() => setFormError(null)}>
          {formError === 'captcha_required' ? t('auth.captcha_required') : t(`auth.errors.${formError}`)}
          {formError === 'email_taken' && (
            <span className="mt-2 flex flex-wrap gap-x-4">
              <Link href="/login" className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}>
                {t('auth.loginLink')}
              </Link>
              <Link href="/forgot-password" className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}>
                {t('auth.forgot_password_link')}
              </Link>
            </span>
          )}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label={t('auth.full_name')}
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t('auth.full_name_ph')}
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          required
        />

        <div>
          <Input
            label={t('auth.email_address')}
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t('auth.email_ph')}
            value={formData.email}
            onChange={handleInputChange}
            onBlur={checkEmailDomain}
            error={errors.email}
            required
          />
          <div className="mt-1.5 min-h-5 text-body-sm" aria-live="polite">
            {domainHint && domain.status === 'checking' && <span className="text-muted-foreground">{t('auth.domain_checking')}</span>}
            {domainHint && domain.status === 'valid' && (
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle size={14} aria-hidden="true" />
                {t('auth.domain_verified')}
              </span>
            )}
            {domainHint && domain.status === 'warning' && (
              <span className="flex items-center gap-1.5 text-warning">
                <Warning size={14} aria-hidden="true" />
                {t(`auth.domain.${domain.code}`)}
              </span>
            )}
            {domainHint && domain.status === 'invalid' && (
              <span className="flex items-center gap-1.5 text-danger">
                <XCircle size={14} aria-hidden="true" />
                {t(`auth.domain.${domain.code}`)}
              </span>
            )}
          </div>
        </div>

        <div>
          <Input
            label={t('auth.password')}
            id="signup-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            aria-describedby={errors.password ? 'signup-password-error password-rules' : 'password-rules'}
            required
            suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          <PasswordRules id="password-rules" password={formData.password} />
        </div>

        <Input
          label={t('auth.confirm_password')}
          id="signup-confirm-password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
          suffix={<PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />}
        />

        {captcha.widget}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText={t('auth.creating')}
          className="rounded-full"
        >
          {t('auth.create_account')}
        </Button>

        <p className="text-body-sm text-muted-foreground">
          {withLinks(t('auth.consent'), {
            terms: (
              <Link href="/terms" className={LINK_CLASS}>
                {t('auth.terms_link')}
              </Link>
            ),
            privacy: (
              <Link href="/privacy" className={LINK_CLASS}>
                {t('auth.privacy_link')}
              </Link>
            ),
          })}
        </p>
      </form>

      <Paragraph className="text-center text-body-md text-muted-foreground md:text-left">
        {t('auth.has_workspace')}{' '}
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.loginLink')}
        </Link>
      </Paragraph>
    </AuthShell>
  );
}
