import { z } from 'zod';
import { getDueNotifications } from '@/libs/notificationLogic';
import { authorizeCron } from '@/libs/cron/auth';
import {
  configureWebPush,
  createAdminClient,
  type AdminClient,
  cronError,
  cronResponse,
  recordCronRun,
  sendToSubscription,
} from '@/libs/cron/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// How long a missed trigger stays deliverable; covers failed or skipped cron runs.
const CATCHUP_MINUTES = 15;
// Upper bound for notify_times offsets when selecting candidate reminders.
const LOOKAHEAD_DAYS = 30;
const PUSH_TTL_SECONDS = 4 * 60 * 60;
const LEDGER_RETENTION_DAYS = 7;
const CRON_RUN_RETENTION_DAYS = 30;
const STALE_SUBSCRIPTION_DAYS = 90;

const ReminderRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high']).nullable().optional(),
  due_datetime: z.string(),
  due_time: z.string().nullable().optional(),
  notify_times: z.array(z.number()).nullable().optional(),
});

const SubscriptionRowSchema = z.object({
  user_id: z.string(),
  endpoint: z.string().min(1),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  failure_count: z.number().nullable().optional(),
});

type ReminderRow = z.infer<typeof ReminderRowSchema>;

interface Candidate {
  reminder: ReminderRow;
  notifyMinutes: number;
  dueAt: Date;
}

const claimKey = (reminderId: string, notifyMinutes: number, dueAt: Date | string) =>
  `${reminderId}|${notifyMinutes}|${new Date(dueAt).getTime()}`;

const daysAgo = (days: number, from: Date) => new Date(from.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export async function GET(request: Request) {
  const unauthorized = authorizeCron(request);
  if (unauthorized) return unauthorized;

  const startedAt = new Date();
  const now = startedAt;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return cronError('Supabase credentials missing');

  const supabase = createAdminClient(supabaseUrl, supabaseKey);

  if (now.getUTCMinutes() === 0) {
    await runHourlyMaintenance(supabase, now);
  }

  const windowStart = new Date(now.getTime() - CATCHUP_MINUTES * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: rawReminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, user_id, title, priority, due_datetime, due_time, notify_times')
    .eq('status', 'pending')
    .is('deleted_at', null)
    .not('due_datetime', 'is', null)
    .gte('due_datetime', windowStart)
    .lte('due_datetime', windowEnd);

  if (remindersError) return cronError(`Failed to fetch reminders: ${remindersError.message}`);

  const candidates: Candidate[] = [];
  let skippedReminders = 0;
  for (const row of rawReminders ?? []) {
    const parsed = ReminderRowSchema.safeParse(row);
    if (!parsed.success) {
      skippedReminders++;
      continue;
    }
    const reminder = parsed.data;
    for (const due of getDueNotifications(now, reminder.due_datetime, reminder.notify_times ?? [], CATCHUP_MINUTES)) {
      candidates.push({ reminder, notifyMinutes: due.notifyMinutes, dueAt: due.dueAt });
    }
  }

  if (candidates.length === 0) {
    return cronResponse({ due: 0, sent: 0, failed: 0, skippedReminders });
  }

  const userIds = [...new Set(candidates.map((c) => c.reminder.user_id))];

  const { data: prefRows } = await supabase
    .from('user_preferences')
    .select('user_id, notifications_enabled, push_notifications_enabled')
    .in('user_id', userIds);

  const disabledUsers = new Set(
    (prefRows ?? [])
      .filter((p) => !((p.notifications_enabled ?? true) && (p.push_notifications_enabled ?? true)))
      .map((p) => p.user_id as string)
  );

  const { data: rawSubscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth, failure_count')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) return cronError(`Failed to fetch push subscriptions: ${subError.message}`);

  const subscriptionsByUser = new Map<string, z.infer<typeof SubscriptionRowSchema>[]>();
  for (const row of rawSubscriptions ?? []) {
    const parsed = SubscriptionRowSchema.safeParse(row);
    if (!parsed.success) continue;
    const list = subscriptionsByUser.get(parsed.data.user_id) ?? [];
    list.push(parsed.data);
    subscriptionsByUser.set(parsed.data.user_id, list);
  }

  // Users without an active subscription are left unclaimed so a late subscription
  // (app reopened inside the catch-up window) still receives the notification.
  const deliverable = candidates.filter(
    (c) => !disabledUsers.has(c.reminder.user_id) && subscriptionsByUser.has(c.reminder.user_id)
  );

  if (deliverable.length === 0) {
    return cronResponse({ due: 0, sent: 0, failed: 0, skippedReminders, noSubscription: candidates.length });
  }

  // Claim before sending: the unique key makes concurrent or repeated runs deliver each notification once.
  const { data: claimedRows, error: claimError } = await supabase
    .from('reminder_notifications')
    .upsert(
      deliverable.map((c) => ({
        reminder_id: c.reminder.id,
        notify_minutes: c.notifyMinutes,
        due_at: c.dueAt.toISOString(),
        user_id: c.reminder.user_id,
      })),
      { onConflict: 'reminder_id,notify_minutes,due_at', ignoreDuplicates: true }
    )
    .select('reminder_id, notify_minutes, due_at');

  if (claimError) return cronError(`Failed to claim notifications: ${claimError.message}`);

  const claimed = new Set((claimedRows ?? []).map((r) => claimKey(r.reminder_id, r.notify_minutes, r.due_at)));
  const toSend = deliverable.filter((c) => claimed.has(claimKey(c.reminder.id, c.notifyMinutes, c.dueAt)));

  if (toSend.length === 0) {
    return cronResponse({ due: 0, sent: 0, failed: 0, skippedReminders, alreadySent: deliverable.length });
  }

  const vapidError = configureWebPush();
  if (vapidError) {
    await releaseClaims(supabase, toSend);
    return cronError(vapidError);
  }

  const byUser = new Map<string, Candidate[]>();
  for (const c of toSend) {
    byUser.set(c.reminder.user_id, [...(byUser.get(c.reminder.user_id) ?? []), c]);
  }

  let sent = 0;
  let failed = 0;

  await Promise.all(
    [...byUser.entries()].map(async ([userId, items]) => {
      const subs = subscriptionsByUser.get(userId) ?? [];
      const payload = buildPayload(items.map((i) => i.reminder));
      const results = await Promise.all(subs.map((sub) => sendToSubscription(supabase, sub, payload, PUSH_TTL_SECONDS)));

      const userSent = results.filter(Boolean).length;
      sent += userSent;
      failed += results.length - userSent;

      // Nothing reached the user: free the claim so the next run retries within the catch-up window.
      if (userSent === 0) await releaseClaims(supabase, items);
    })
  );

  const outcome = { due: toSend.length, sent, failed, skippedReminders };
  await recordCronRun(supabase, 'reminders', startedAt, outcome);
  return cronResponse(outcome);
}

function buildPayload(reminders: ReminderRow[]): string {
  let body: string;
  if (reminders.length === 1) {
    const [r] = reminders;
    body = r.due_time ? `${r.title} at ${r.due_time}` : r.title;
  } else if (reminders.length <= 3) {
    body = `${reminders.length} reminders: ${reminders.map((r) => r.title).join(', ')}`;
  } else {
    body = `You have ${reminders.length} reminders coming up.`;
  }

  return JSON.stringify({
    title: 'TRASON Reminders',
    body,
    url: '/reminders',
    tag: reminders.length === 1 ? `reminder-${reminders[0].id}` : 'reminders-batch',
    priority: reminders.some((r) => r.priority === 'high') ? 'high' : 'normal',
  });
}

async function releaseClaims(supabase: AdminClient, items: Candidate[]) {
  await Promise.all(
    items.map((c) =>
      supabase
        .from('reminder_notifications')
        .delete()
        .eq('reminder_id', c.reminder.id)
        .eq('notify_minutes', c.notifyMinutes)
    )
  );
}

async function runHourlyMaintenance(supabase: AdminClient, now: Date) {
  const results = await Promise.all([
    supabase.from('reminder_notifications').delete().lt('sent_at', daysAgo(LEDGER_RETENTION_DAYS, now)),
    supabase.from('cron_runs').delete().lt('started_at', daysAgo(CRON_RUN_RETENTION_DAYS, now)),
    supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('last_used_at', daysAgo(STALE_SUBSCRIPTION_DAYS, now)),
  ]);
  results.forEach(({ error }) => {
    if (error) console.warn('[CRON-REMINDERS] Maintenance step failed (non-fatal):', error.message);
  });
}
