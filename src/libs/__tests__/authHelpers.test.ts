import { safeRedirectPath } from '../authRedirect';
import { authErrorKey } from '../authErrors';
import { failedPasswordRules, getEmailIssue } from '../validation';

describe('safeRedirectPath', () => {
  it('keeps same-origin paths with query and hash', () => {
    expect(safeRedirectPath('/finance?month=2026-10#list')).toBe('/finance?month=2026-10#list');
  });

  it.each([
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '\\\\evil.com',
    'javascript:alert(1)',
    'dashboard',
    '',
    null,
    undefined,
  ])('falls back for %p', (value) => {
    expect(safeRedirectPath(value)).toBe('/dashboard');
  });

  it('uses the given fallback', () => {
    expect(safeRedirectPath('https://evil.com', '/onboarding')).toBe('/onboarding');
  });
});

describe('authErrorKey', () => {
  it('maps known Supabase codes', () => {
    expect(authErrorKey({ code: 'invalid_credentials', status: 400 })).toBe('invalid_credentials');
    expect(authErrorKey({ code: 'user_already_exists', status: 422 })).toBe('email_taken');
    expect(authErrorKey({ code: 'over_email_send_rate_limit', status: 429 })).toBe('email_rate_limited');
    expect(authErrorKey({ code: 'otp_expired', status: 403 })).toBe('link_invalid');
  });

  it('falls back on error class, then status', () => {
    expect(authErrorKey({ name: 'AuthRetryableFetchError', status: 0 })).toBe('network');
    expect(authErrorKey({ name: 'AuthWeakPasswordError', status: 422 })).toBe('weak_password');
    expect(authErrorKey({ status: 429 })).toBe('rate_limited');
    expect(authErrorKey({ status: 503 })).toBe('server');
  });

  it('returns unknown for anything else', () => {
    expect(authErrorKey({ code: 'something_new', status: 400 })).toBe('unknown');
    expect(authErrorKey(null)).toBe('unknown');
    expect(authErrorKey('boom')).toBe('unknown');
  });
});

describe('password and email rules', () => {
  it('lists every failed password rule', () => {
    expect(failedPasswordRules('abc')).toEqual(['length', 'upper', 'number']);
    expect(failedPasswordRules('Abcdefg1')).toEqual([]);
  });

  it('classifies email issues', () => {
    expect(getEmailIssue('  ')).toBe('required');
    expect(getEmailIssue('nope')).toBe('invalid');
    expect(getEmailIssue(' user@mail.com ')).toBeNull();
  });
});
