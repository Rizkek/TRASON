'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordToggle } from '@/components/auth/PasswordToggle';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { supabase } from '@/services/supabase/supabaseClient';
import { userQueries } from '@/services/core/userQueries';
import { validateEmail, validatePassword, sanitizeError } from '@/libs/validation';
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react';

type DomainStatus = null | 'checking' | 'valid' | 'warning' | 'invalid';
type Notice = { kind: 'error' | 'success'; message: string };

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailDomainStatus, setEmailDomainStatus] = useState<DomainStatus>(null);
  const [emailDomainMessage, setEmailDomainMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailDomainStatus(null);
      setEmailDomainMessage(null);
    }
  };

  const checkEmailDomain = async (email: string) => {
    if (validateEmail(email)) return;

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
      }
    } catch {
      // A network failure must not block signup.
      setEmailDomainStatus(null);
    }
  };

  const handleEmailBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkEmailDomain(formData.email), 300);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t('auth.name_required');

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    else if (emailDomainStatus === 'invalid') errors.email = emailDomainMessage || 'Email domain is invalid';

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) errors.password = passwordErrors[0];

    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('auth.passwords_mismatch');

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const signUpErrorMessage = (signUpError: any): string => {
    const message = signUpError?.message ?? 'Unable to register';
    if (signUpError?.status === 500) return t('auth.server_error');
    if (
      signUpError?.status === 409 ||
      signUpError?.code === 'DUPLICATE' ||
      /duplicate|already exists|users_email_key|email.*exists/i.test(message)
    ) {
      return t('auth.email_taken');
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setNotice(null);

    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: { data: { first_name: firstName, last_name: lastNameParts.join(' ') } },
      });

      if (signUpError) {
        console.error('Supabase signUp error:', signUpError);
        setNotice({ kind: 'error', message: signUpErrorMessage(signUpError) });
        return;
      }
      if (data.user) {
        if (data.session) {
          await userQueries.ensureUserProfile();
          router.push('/onboarding');
        } else {
          setNotice({ kind: 'success', message: t('auth.check_email') });
          setTimeout(() => router.push('/login'), 3000);
        }
      }
    } catch (err) {
      setNotice({ kind: 'error', message: sanitizeError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const showDomainHint = formData.email && !validationErrors.email && emailDomainStatus;

  return (
    <AuthShell quote={t('auth.signup_quote')} description={t('auth.signup_panel_desc')} busy={isLoading}>
      <div className="space-y-2">
        <Heading as="h1" size="h2">
          {t('auth.signup_heading')}
        </Heading>
        <Paragraph className="text-body-md text-muted-foreground">{t('auth.signup_lede')}</Paragraph>
      </div>

      {notice && (
        <Alert
          type={notice.kind}
          title={notice.kind === 'success' ? t('auth.register_success_title') : t('auth.register_error_title')}
          onDismiss={() => setNotice(null)}
        >
          {notice.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label={t('auth.full_name')}
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t('auth.full_name_ph')}
          value={formData.name}
          onChange={handleInputChange}
          error={validationErrors.name}
          required
        />

        <div>
          <Input
            label={t('auth.email_address')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('auth.email_ph')}
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}
            error={validationErrors.email}
            required
          />
          {showDomainHint && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs" aria-live="polite">
              {emailDomainStatus === 'checking' && <span className="text-muted-foreground">{t('auth.domain_checking')}</span>}
              {emailDomainStatus === 'valid' && (
                <>
                  <CheckCircle size={14} aria-hidden="true" className="text-success" />
                  <span className="text-success">{t('auth.domain_verified')}</span>
                </>
              )}
              {emailDomainStatus === 'warning' && (
                <>
                  <Warning size={14} aria-hidden="true" className="text-warning" />
                  <span className="text-warning">{emailDomainMessage}</span>
                </>
              )}
              {emailDomainStatus === 'invalid' && (
                <>
                  <XCircle size={14} aria-hidden="true" className="text-danger" />
                  <span className="text-danger">{emailDomainMessage}</span>
                </>
              )}
            </div>
          )}
        </div>

        <Input
          label={t('auth.password')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="********"
          value={formData.password}
          onChange={handleInputChange}
          error={validationErrors.password}
          required
          suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <Input
          label={t('auth.confirm_password')}
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={validationErrors.confirmPassword}
          required
          suffix={<PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText={t('auth.creating')}
          className="mt-2 rounded-full"
        >
          {t('auth.create_account')}
        </Button>
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
