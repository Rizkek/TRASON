const PLACEHOLDER_ORIGIN = 'http://trason.local';

/**
 * Returns a same-origin path for post-auth navigation, or the fallback.
 * `redirect_to` and `next` come from the URL, so anything absolute ("https://evil.com"),
 * protocol-relative ("//evil.com") or backslash-tricked ("/\evil.com") must be rejected.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;

  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** Where Supabase auth emails send the user back to; must be listed in the project's Redirect URLs. */
export function authConfirmUrl(origin: string, next: string): string {
  return `${origin}/auth/confirm?next=${encodeURIComponent(safeRedirectPath(next))}`;
}
