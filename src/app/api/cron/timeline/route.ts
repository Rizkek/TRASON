import { z } from 'zod';
import { getLocalDateHour, shouldSendTaskReminder } from '@/libs/notificationLogic';
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

const ACTIVE_HOURS = { start: 6, end: 23 };
const PUSH_TTL_SECONDS = 2 * 60 * 60;

const DailyTaskRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  completed_today: z.boolean(),
  last_reset_date: z.string().nullable().optional(),
});

const SubscriptionRowSchema = z.object({
  user_id: z.string(),
  endpoint: z.string().min(1),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  failure_count: z.number().nullable().optional(),
});

interface Nudge {
  titles: string[];
  localDate: string;
  localHour: number;
}

export async function GET(request: Request) {
  const unauthorized = authorizeCron(request);
  if (unauthorized) return unauthorized;

  const startedAt = new Date();
  const now = startedAt;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return cronError('Supabase credentials missing');

  const supabase = createAdminClient(supabaseUrl, supabaseKey);

  const { data: rawTasks, error: tasksError } = await supabase
    .from('daily_tasks')
    .select('id, user_id, title, completed_today, last_reset_date')
    .is('deleted_at', null);

  if (tasksError) return cronError(`Failed to fetch daily tasks: ${tasksError.message}`);

  const tasks: z.infer<typeof DailyTaskRowSchema>[] = [];
  let skippedTasks = 0;
  for (const row of rawTasks ?? []) {
    const parsed = DailyTaskRowSchema.safeParse(row);
    if (parsed.success) tasks.push(parsed.data);
    else skippedTasks++;
  }

  const userIds = [...new Set(tasks.map((t) => t.user_id))];
  if (userIds.length === 0) return cronResponse({ due: 0, sent: 0, failed: 0, skippedTasks });

  const { data: prefRows } = await supabase
    .from('user_preferences')
    .select('user_id, timezone, notifications_enabled, push_notifications_enabled')
    .in('user_id', userIds);

  const timezoneByUser = new Map<string, string>();
  const enabledUsers = new Set<string>();
  for (const p of prefRows ?? []) {
    if (p.timezone) timezoneByUser.set(p.user_id, p.timezone);
    if ((p.notifications_enabled ?? true) && (p.push_notifications_enabled ?? true)) enabledUsers.add(p.user_id);
  }

  const nudgesByUser = new Map<string, Nudge>();
  for (const task of tasks) {
    if (!enabledUsers.has(task.user_id)) continue;

    const timezone = timezoneByUser.get(task.user_id) ?? 'UTC';
    if (!shouldSendTaskReminder(now, timezone, task, ACTIVE_HOURS)) continue;

    const nudge = nudgesByUser.get(task.user_id) ?? { titles: [], ...toLocal(now, timezone) };
    nudge.titles.push(task.title);
    nudgesByUser.set(task.user_id, nudge);
  }

  if (nudgesByUser.size === 0) return cronResponse({ due: 0, sent: 0, failed: 0, skippedTasks });

  const { data: rawSubscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth, failure_count')
    .in('user_id', [...nudgesByUser.keys()])
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

  const deliverableUsers = [...nudgesByUser.keys()].filter((id) => subscriptionsByUser.has(id));
  if (deliverableUsers.length === 0) {
    return cronResponse({ due: 0, sent: 0, failed: 0, skippedTasks, noSubscription: nudgesByUser.size });
  }

  // One nudge per user per local hour regardless of how often this endpoint is called.
  const { data: claimedRows, error: claimError } = await supabase
    .from('task_nudges')
    .upsert(
      deliverableUsers.map((userId) => {
        const { localDate, localHour } = nudgesByUser.get(userId)!;
        return { user_id: userId, local_date: localDate, local_hour: localHour };
      }),
      { onConflict: 'user_id,local_date,local_hour', ignoreDuplicates: true }
    )
    .select('user_id');

  if (claimError) return cronError(`Failed to claim task nudges: ${claimError.message}`);

  const claimedUsers = (claimedRows ?? []).map((r) => r.user_id as string);
  if (claimedUsers.length === 0) {
    return cronResponse({ due: 0, sent: 0, failed: 0, skippedTasks, alreadySent: deliverableUsers.length });
  }

  const vapidError = configureWebPush();
  if (vapidError) {
    await releaseClaims(supabase, claimedUsers, nudgesByUser);
    return cronError(vapidError);
  }

  let sent = 0;
  let failed = 0;

  await Promise.all(
    claimedUsers.map(async (userId) => {
      const subs = subscriptionsByUser.get(userId) ?? [];
      const payload = buildPayload(nudgesByUser.get(userId)!.titles);
      const results = await Promise.all(subs.map((sub) => sendToSubscription(supabase, sub, payload, PUSH_TTL_SECONDS)));

      const userSent = results.filter(Boolean).length;
      sent += userSent;
      failed += results.length - userSent;

      if (userSent === 0) await releaseClaims(supabase, [userId], nudgesByUser);
    })
  );

  const outcome = { due: claimedUsers.length, sent, failed, skippedTasks };
  await recordCronRun(supabase, 'timeline', startedAt, outcome);
  return cronResponse(outcome);
}

function toLocal(now: Date, timezone: string) {
  const { date, hour } = getLocalDateHour(now, timezone);
  return { localDate: date, localHour: hour };
}

function buildPayload(titles: string[]): string {
  const body =
    titles.length <= 3
      ? `You have ${titles.length} task(s) left: ${titles.join(', ')}`
      : `You have ${titles.length} tasks left today.`;

  return JSON.stringify({ title: 'Daily Task Reminder', body, url: '/schedule', tag: 'daily-timeline' });
}

async function releaseClaims(
  supabase: AdminClient,
  userIds: string[],
  nudges: Map<string, Nudge>
) {
  await Promise.all(
    userIds.map((userId) => {
      const { localDate, localHour } = nudges.get(userId)!;
      return supabase
        .from('task_nudges')
        .delete()
        .eq('user_id', userId)
        .eq('local_date', localDate)
        .eq('local_hour', localHour);
    })
  );
}
