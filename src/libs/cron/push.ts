import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = (url: string, serviceRoleKey: string) => createClient(url, serviceRoleKey);
export type AdminClient = ReturnType<typeof createAdminClient>;

// 404/410 are the only codes that mean the subscription is gone for good.
// Other failures (400/401/403/5xx) are often transient on the push service side.
const EXPIRED_STATUS_CODES = [404, 410];
const MAX_CONSECUTIVE_FAILURES = 5;

export interface PushSubscriptionRow {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  failure_count?: number | null;
}

export function configureWebPush(): string | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return 'VAPID keys missing';

  try {
    webpush.setVapidDetails(process.env.VAPID_EMAIL || 'mailto:admin@trason.app', publicKey, privateKey);
    return null;
  } catch (error) {
    console.error('[CRON] Invalid VAPID configuration:', error);
    return 'Invalid VAPID configuration';
  }
}

export async function sendToSubscription(
  supabase: AdminClient,
  sub: PushSubscriptionRow,
  payload: string,
  ttlSeconds: number
): Promise<boolean> {
  try {
    // urgency "high" keeps push services from deferring delivery while the device is idle.
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload,
      { TTL: ttlSeconds, urgency: 'high' }
    );

    const now = new Date().toISOString();
    await supabase
      .from('push_subscriptions')
      .update({ failure_count: 0, last_error: null, last_success_at: now, last_used_at: now })
      .eq('endpoint', sub.endpoint);
    return true;
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    const message = error instanceof Error ? error.message : String(error);
    const failures = (sub.failure_count ?? 0) + 1;
    const isExpired = statusCode !== undefined && EXPIRED_STATUS_CODES.includes(statusCode);
    const shouldDeactivate = isExpired || failures >= MAX_CONSECUTIVE_FAILURES;

    console.error(`[CRON] Push failed for user ${sub.user_id}: status=${statusCode ?? 'n/a'} failures=${failures} deactivate=${shouldDeactivate}`);

    await supabase
      .from('push_subscriptions')
      .update({
        failure_count: failures,
        last_error: `${statusCode ?? 'ERR'}: ${message}`.slice(0, 250),
        ...(shouldDeactivate ? { is_active: false } : {}),
      })
      .eq('endpoint', sub.endpoint);
    return false;
  }
}

interface CronOutcome {
  due: number;
  sent: number;
  failed: number;
  [key: string]: unknown;
}

// A 2xx is reserved for runs that either had nothing to do or delivered something,
// so the cron service's "success" actually means notifications went out.
export function cronResponse(outcome: CronOutcome) {
  const allFailed = outcome.due > 0 && outcome.sent === 0 && outcome.failed > 0;
  return NextResponse.json({ success: !allFailed, ...outcome }, { status: allFailed ? 500 : 200 });
}

export function cronError(message: string, status = 500) {
  console.error(`[CRON] ${message}`);
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function recordCronRun(
  supabase: AdminClient,
  job: string,
  startedAt: Date,
  outcome: CronOutcome
) {
  // Idle runs would add 1440 rows a day for a per-minute job; the cron service's own history covers liveness.
  if (outcome.due === 0 && outcome.failed === 0) return;

  const { error } = await supabase.from('cron_runs').insert({
    job,
    started_at: startedAt.toISOString(),
    duration_ms: Date.now() - startedAt.getTime(),
    due: outcome.due,
    sent: outcome.sent,
    failed: outcome.failed,
  });
  if (error) console.warn(`[CRON] Could not record run for ${job}:`, error.message);
}
