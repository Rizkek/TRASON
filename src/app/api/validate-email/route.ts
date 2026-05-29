import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/validate-email
 * 
 * Validates whether an email domain has MX records (i.e., is capable of receiving email).
 * Uses Cloudflare DNS-over-HTTPS to avoid server-side DNS lookup limitations.
 * 
 * Returns:
 * - { valid: true }  — domain has MX records
 * - { valid: false, reason: string } — domain has no MX records or is invalid
 * - { valid: true, warning: string } — DNS lookup failed; we allow signup but warn
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ valid: false, reason: 'Email is required' }, { status: 400 });
    }

    // Basic format check first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ valid: false, reason: 'Invalid email format' });
    }

    const domain = email.split('@')[1].toLowerCase();

    // Block obvious disposable/test domains
    const BLOCKED_DOMAINS = [
      'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
      'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
      'spam4.me', 'yopmail.com', 'trashmail.com', 'dispostable.com',
      'fakeinbox.com', 'maildrop.cc', 'mintemail.com', 'spamgourmet.com',
      'example.com', 'test.com', 'localhost',
    ];

    if (BLOCKED_DOMAINS.includes(domain)) {
      return NextResponse.json({
        valid: false,
        reason: 'Disposable or test email addresses are not allowed',
      });
    }

    // Query Cloudflare DNS-over-HTTPS for MX records
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const dnsRes = await fetch(dnsUrl, {
        headers: { Accept: 'application/dns-json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!dnsRes.ok) {
        // DNS service unavailable — allow signup with warning
        return NextResponse.json({
          valid: true,
          warning: 'Could not verify email domain. Proceed with caution.',
        });
      }

      const dnsData = await dnsRes.json();

      // Check for MX records (type 15) or A records as fallback
      const hasMX = dnsData.Answer?.some((r: any) => r.type === 15);
      const hasA = dnsData.Answer?.some((r: any) => r.type === 1 || r.type === 28);

      if (dnsData.Status === 3 || (!hasMX && !hasA)) {
        // NXDOMAIN (Status 3) = domain does not exist
        return NextResponse.json({
          valid: false,
          reason: `The domain "${domain}" does not appear to exist or cannot receive email`,
        });
      }

      if (!hasMX && hasA) {
        // Has A record but no MX — domain exists but may not accept email
        // Still allow it (many small domains use implicit MX)
        return NextResponse.json({
          valid: true,
          warning: `Domain "${domain}" has no mail server (MX) records. Are you sure this email is correct?`,
        });
      }

      return NextResponse.json({ valid: true });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        // Timeout — don't block the user
        return NextResponse.json({
          valid: true,
          warning: 'Email domain check timed out. Please double-check your email.',
        });
      }
      throw fetchErr;
    }
  } catch (err) {
    console.error('[validate-email] Unexpected error:', err);
    // Fail open — don't block signup if our validation crashes
    return NextResponse.json({
      valid: true,
      warning: 'Could not verify email domain.',
    });
  }
}
