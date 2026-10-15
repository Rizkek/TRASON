import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Returns a response to short-circuit the request, or null when the caller is authorized.
 * Fails closed: a missing CRON_SECRET rejects every request instead of leaving the route open.
 * The secret is accepted only from the Authorization header so it never lands in URLs or access logs.
 */
export function authorizeCron(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[CRON] CRON_SECRET is not configured; rejecting request.');
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const provided = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
