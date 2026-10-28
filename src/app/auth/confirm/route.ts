import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { safeRedirectPath } from '@/libs/authRedirect';

const OTP_TYPES: EmailOtpType[] = ['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change'];

/**
 * Landing point for links in Supabase auth emails (signup confirmation, password reset).
 * `token_hash` links work on any device; `code` links (PKCE, the default template) only
 * work in the browser that started the flow, because the code verifier lives in its cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const fallback = type === 'recovery' ? '/reset-password' : '/onboarding';
  const next = safeRedirectPath(searchParams.get('next'), fallback);

  const supabase = await createClient();
  let failed = true;

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  }

  if (failed) {
    const target = next === '/reset-password' ? '/forgot-password' : '/login';
    return NextResponse.redirect(new URL(`${target}?auth_error=link_invalid`, origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
