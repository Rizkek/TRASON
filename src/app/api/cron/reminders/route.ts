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

  // Fetch pending reminders with a wide UTC window that covers "today" across all timezones
  // (UTC-12 to UTC+14 = 38h window). Per-user timezone filtering happens in memory below.
  const startOfWindowUTC = new Date();
  startOfWindowUTC.setUTCHours(0, 0, 0, 0);
  startOfWindowUTC.setUTCDate(startOfWindowUTC.getUTCDate() - 1); // cover UTC-12 (yesterday UTC)
  const endOfWindowUTC = new Date();
  endOfWindowUTC.setUTCHours(23, 59, 59, 999);
  endOfWindowUTC.setUTCDate(endOfWindowUTC.getUTCDate() + 1); // cover UTC+14 (tomorrow UTC)

  console.log(`[CRON-REMINDERS] Fetching pending reminders in window: ${startOfWindowUTC.toISOString()} → ${endOfWindowUTC.toISOString()}`);
  const { data: rawReminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, user_id, title, due_datetime, due_time, notify_times')
    .eq('status', 'pending')
    .is('deleted_at', null)
    .not('due_datetime', 'is', null)
    .gte('due_datetime', startOfWindowUTC.toISOString())
    .lte('due_datetime', endOfWindowUTC.toISOString());

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
      allReminders.push(parsed.data);
    } else {
      skippedReminders++;
      console.warn('[CRON-REMINDERS] Skipping malformed reminder row:', {
        id: (row as any)?.id,
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  console.log(`[CRON-REMINDERS] ${allReminders.length} reminders in window. Filtering by per-user timezone...`);

  if (allReminders.length === 0) {
    console.log('[CRON-REMINDERS] No valid reminders after Zod parse. Exiting early.');
    return NextResponse.json({ success: true, sent: 0, message: 'No reminders today', skippedReminders });
  }

  // Fetch per-user timezones from user_preferences
  const allUserIds = [...new Set(allReminders.map((r) => r.user_id))];
  const { data: prefRows } = await supabase
    .from('user_preferences')
    .select('user_id, timezone')
    .in('user_id', allUserIds);

  const userTimezoneMap: Record<string, string> = {};
  (prefRows || []).forEach((p) => {
    if (p.user_id && p.timezone) userTimezoneMap[p.user_id] = p.timezone;
  });
  console.log(`[CRON-REMINDERS] Resolved timezones for ${Object.keys(userTimezoneMap).length}/${allUserIds.length} users.`);

  // Filter reminders to only those due today in the user's own timezone
  const todayReminders = allReminders.filter((r) => {
    if (!r.due_datetime) return false;
    const userTz = userTimezoneMap[r.user_id] || 'UTC';
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: userTz });
    const dueDateStr = new Date(r.due_datetime).toLocaleDateString('en-CA', { timeZone: userTz });
    const isToday = dueDateStr === todayStr;
    console.log(`[CRON-REMINDERS] Reminder "${r.title}" (${r.user_id}) tz=${userTz} due=${dueDateStr} today=${todayStr} → include=${isToday}`);
    return isToday;
  });

  console.log(`[CRON-REMINDERS] ${todayReminders.length}/${allReminders.length} reminders qualify for today across all timezones.`);

  if (todayReminders.length === 0) {
    console.log('[CRON-REMINDERS] No reminders due today (per user timezone). Exiting early.');
    return NextResponse.json({ success: true, sent: 0, message: 'No reminders due today', skippedReminders });
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
  todayReminders.forEach((r) => {
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
