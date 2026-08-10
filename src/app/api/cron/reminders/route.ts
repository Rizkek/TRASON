import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { z } from 'zod';

export const runtime = 'nodejs';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ReminderRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  due_datetime: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  notify_times: z.array(z.number()).nullable().optional(),
});

const PushSubscriptionRowSchema = z.object({
  user_id: z.string(),
  endpoint: z.string().min(1, 'endpoint cannot be empty'),
  p256dh: z.string().min(1, 'p256dh cannot be empty'),
  auth: z.string().min(1, 'auth cannot be empty'),
});

type ReminderRow = z.infer<typeof ReminderRowSchema>;

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-REMINDERS] [${now.toISOString()}] Route invoked.`);

  // Validate Secret
  const authHeader = request.headers.get('Authorization');
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET;

  console.log(`[CRON-REMINDERS] Auth present: ${!!authHeader}, CRON_SECRET set: ${!!expectedSecret}`);

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
    console.warn('[CRON-REMINDERS] Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`[CRON-REMINDERS] Supabase credentials missing!`);
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // --- Cleanup stale subscriptions (not used in 90+ days) ---
  const staleThreshold = new Date();
  staleThreshold.setDate(staleThreshold.getDate() - 90);
  const { error: cleanupError } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('last_used_at', staleThreshold.toISOString());

  if (cleanupError) {
    console.warn('[CRON-REMINDERS] Stale cleanup failed (non-fatal):', cleanupError.message);
  } else {
    console.log('[CRON-REMINDERS] Stale subscription cleanup done.');
  }
  // -----------------------------------------------------------

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch reminders that are either due TODAY (and not in the past) or have no date
  console.log(`[CRON-REMINDERS] Fetching pending reminders for today...`);
  const { data: rawReminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, user_id, title, due_datetime, due_time, notify_times')
    .eq('status', 'pending')
    .is('deleted_at', null)
    .or('due_datetime.is.null,due_datetime.gte.now()');

  if (remindersError) {
    console.error('[CRON-REMINDERS] Failed to fetch reminders:', remindersError);
    return NextResponse.json({ error: remindersError.message }, { status: 500 });
  }

  if (!rawReminders || rawReminders.length === 0) {
    console.log('[CRON-REMINDERS] No upcoming pending reminders. Exiting early.');
    return NextResponse.json({ success: true, sent: 0, message: 'No upcoming pending reminders' });
  }

  // ── Zod: validate each reminder row ──────────────────────────────────────
  const allReminders: ReminderRow[] = [];
  let skippedReminders = 0;
  for (const row of rawReminders) {
    const parsed = ReminderRowSchema.safeParse(row);
    if (parsed.success) {
      // Only keep it if it's due today or has no due date
      const isToday = !parsed.data.due_datetime || parsed.data.due_datetime.startsWith(todayStr);
      if (isToday) {
        allReminders.push(parsed.data);
      }
    } else {
      skippedReminders++;
      console.warn('[CRON-REMINDERS] Skipping malformed reminder row:', {
        id: (row as any)?.id,
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  console.log(`[CRON-REMINDERS] ${allReminders.length} reminders qualify for notification today.`);

  if (allReminders.length === 0) {
    console.log('[CRON-REMINDERS] No reminders match today. Exiting early.');
    return NextResponse.json({ success: true, sent: 0, message: 'No reminders today', skippedReminders });
  }

  // VAPID Setup
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.app';

  console.log(`[CRON-REMINDERS] VAPID - Public: ${vapidPublic ? 'Present' : 'MISSING'}, Private: ${vapidPrivate ? 'Present' : 'MISSING'}`);

  if (!vapidPublic || !vapidPrivate) {
    console.error('[CRON-REMINDERS] VAPID keys missing.');
    return NextResponse.json({ error: 'VAPID keys missing', sent: 0 }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  // Group qualifying reminders by user_id
  const remindersByUser: Record<string, ReminderRow[]> = {};
  allReminders.forEach((r) => {
    if (!remindersByUser[r.user_id]) remindersByUser[r.user_id] = [];
    remindersByUser[r.user_id].push(r);
  });

  const userIds = Object.keys(remindersByUser);
  console.log(`[CRON-REMINDERS] ${userIds.length} users have qualifying reminders.`);

  // Fetch push subscriptions
  const { data: rawSubscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) {
    console.error('[CRON-REMINDERS] Failed to fetch push subscriptions:', subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // ── Zod: validate each subscription row ──────────────────────────────────
  const subscriptions: z.infer<typeof PushSubscriptionRowSchema>[] = [];
  let skippedSubs = 0;
  for (const row of rawSubscriptions || []) {
    const parsed = PushSubscriptionRowSchema.safeParse(row);
    if (parsed.success) {
      subscriptions.push(parsed.data);
    } else {
      skippedSubs++;
      console.warn('[CRON-REMINDERS] Malformed subscription (auto-deactivating):', {
        user_id: (row as any)?.user_id,
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
      if ((row as any)?.endpoint) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', (row as any).endpoint);
      }
    }
  }
  console.log(`[CRON-REMINDERS] Valid subscriptions: ${subscriptions.length}, skipped: ${skippedSubs}`);
  // ─────────────────────────────────────────────────────────────────────────

  if (subscriptions.length === 0) {
    console.log('[CRON-REMINDERS] No valid push subscriptions found.');
    return NextResponse.json({ success: true, processedUsers: userIds.length, sent: 0, skippedSubs });
  }

  let sentCount = 0;

  for (const sub of subscriptions) {
    const userId = sub.user_id;
    const userReminders = remindersByUser[userId] || [];
    if (userReminders.length === 0) continue;

    // Build notification body
    let bodyText = '';
    if (userReminders.length === 1) {
      const r = userReminders[0];
      bodyText = r.due_time ? `${r.title} at ${r.due_time}` : r.title;
    } else if (userReminders.length <= 3) {
      bodyText = `${userReminders.length} reminders: ${userReminders.map(r => r.title).join(', ')}`;
    } else {
      bodyText = `You have ${userReminders.length} reminders coming up.`;
    }

    // Tag per-reminder to prevent duplicate browser notifications
    const tag = userReminders.length === 1
      ? `reminder-${userReminders[0].id}`
      : `reminders-batch-${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}`;

    const payload = JSON.stringify({
      title: 'TRASON Reminders',
      body: bodyText,
      url: '/reminders',
      tag,
    });

    let safeEndpoint = 'unknown';
    try {
      const epUrl = new URL(sub.endpoint);
      safeEndpoint = `${epUrl.origin}${epUrl.pathname.substring(0, 15)}...`;
    } catch {
      safeEndpoint = sub.endpoint.substring(0, 25) + '...';
    }

    console.log(`[CRON-REMINDERS] Sending push to user ${userId} (${userReminders.length} reminders). Endpoint: ${safeEndpoint}`);

    try {
      const result = await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sentCount++;
      console.log(`[CRON-REMINDERS] ✅ Sent to user ${userId}. Status: ${result.statusCode}`);
    } catch (err: any) {
      console.error(`[CRON-REMINDERS] ❌ Push failed for user ${userId}:`, {
        message: err.message,
        statusCode: err.statusCode,
      });
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', sub.endpoint);
      }
    }
  }

  console.log(`[CRON-REMINDERS] Done. Sent ${sentCount}/${subscriptions.length}.`);
  return NextResponse.json({
    success: true,
    processedUsers: userIds.length,
    sent: sentCount,
    qualifyingReminders: allReminders.length,
    skippedReminders,
    skippedSubs,
  });
}
