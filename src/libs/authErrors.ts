/** Keys under `auth.errors` in the i18n dictionaries. */
export type AuthErrorKey =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'email_taken'
  | 'weak_password'
  | 'same_password'
  | 'email_invalid'
  | 'rate_limited'
  | 'email_rate_limited'
  | 'captcha_failed'
  | 'signup_disabled'
  | 'link_invalid'
  | 'session_missing'
  | 'network'
  | 'server'
  | 'unknown';

const CODE_TO_KEY: Record<string, AuthErrorKey> = {
  invalid_credentials: 'invalid_credentials',
  email_not_confirmed: 'email_not_confirmed',
  user_already_exists: 'email_taken',
  email_exists: 'email_taken',
  weak_password: 'weak_password',
  same_password: 'same_password',
  email_address_invalid: 'email_invalid',
  email_address_not_authorized: 'email_invalid',
  over_request_rate_limit: 'rate_limited',
  over_email_send_rate_limit: 'email_rate_limited',
  captcha_failed: 'captcha_failed',
  signup_disabled: 'signup_disabled',
  email_provider_disabled: 'signup_disabled',
  otp_expired: 'link_invalid',
  flow_state_expired: 'link_invalid',
  flow_state_not_found: 'link_invalid',
  bad_code_verifier: 'link_invalid',
  session_not_found: 'session_missing',
  session_expired: 'session_missing',
  request_timeout: 'network',
  hook_timeout: 'server',
  unexpected_failure: 'server',
};

interface AuthLikeError {
  name?: string;
  code?: string;
  status?: number;
}

/**
 * Maps a Supabase auth error to a translatable key. Raw `error.message` is English,
 * changes between versions, and sometimes leaks internals, so the UI never shows it.
 */
export function authErrorKey(error: unknown): AuthErrorKey {
  if (!error || typeof error !== 'object') return 'unknown';
  const { name, code, status } = error as AuthLikeError;

  if (code && CODE_TO_KEY[code]) return CODE_TO_KEY[code];
  if (name === 'AuthRetryableFetchError' || status === 0) return 'network';
  if (name === 'AuthWeakPasswordError') return 'weak_password';
  if (name === 'AuthSessionMissingError') return 'session_missing';
  if (status === 429) return 'rate_limited';
  if (status && status >= 500) return 'server';
  return 'unknown';
}
