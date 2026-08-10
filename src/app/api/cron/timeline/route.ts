import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { z } from 'zod';

export const runtime = 'nodejs';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const DailyTaskRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  completed_today: z.boolean(),
  last_reset_date: z.string().nullable().optional(),
});

const PushSubscriptionRowSchema = z.object({
  user_id: z.string(),
  endpoint: z.string().min(1, 'endpoint cannot be empty'),
  p256dh: z.string().min(1, 'p256dh cannot be empty'),
  auth: z.string().min(1, 'auth cannot be empty'),
});

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-TIMELINE] [${now.toISOString()}] Route invoked.`);

  // Security check for cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  console.log(`[CRON-TIMELINE] Authorization header present: ${!!authHeader}, Expected secret present: ${!!expectedSecret}`);

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.warn('[CRON-TIMELINE] Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`[CRON-TIMELINE] Supabase credentials missing! url: ${!!supabaseUrl}, key: ${!!supabaseKey}`);
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // VAPID Setup
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.app';

  console.log(`[CRON-TIMELINE] VAPID Config - Public: ${vapidPublic ? 'Present' : 'MISSING'}, Private: ${vapidPrivate ? 'Present' : 'MISSING'}`);

  if (!vapidPublic || !vapidPrivate) {
    console.error('[CRON-TIMELINE] VAPID keys missing!');
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`[CRON-TIMELINE] Querying daily tasks for date: ${todayStr}`);

  // Fetch all tasks
  const { data: rawTasks, error: tasksError } = await supabase
    .from('daily_tasks')
    .select('id, user_id, title, completed_today, last_reset_date')
    .is('deleted_at', null);

  if (tasksError) {
    console.error('[CRON-TIMELINE] Failed to fetch daily tasks:', tasksError);
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  console.log(`[CRON-TIMELINE] Fetched ${(rawTasks || []).length} total active daily tasks from DB.`);

  // ── Zod: validate each task row, skip malformed ones ──────────────────────
  let skippedTasks = 0;
  const tasks: z.infer<typeof DailyTaskRowSchema>[] = [];
  for (const row of rawTasks || []) {
    const parsed = DailyTaskRowSchema.safeParse(row);
    if (parsed.success) {
      tasks.push(parsed.data);
    } else {
      skippedTasks++;
      console.warn('[CRON-TIMELINE] Skipping malformed task row:', {
        id: (row as any)?.id,
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
    }
  }
  console.log(`[CRON-TIMELINE] Valid tasks: ${tasks.length}, skipped: ${skippedTasks}`);
  // ──────────────────────────────────────────────────────────────────────────

  // Group incomplete tasks by user_id
  const incompleteTasksByUser: Record<string, string[]> = {};

  tasks.forEach((task) => {
    const isIncomplete =
      !task.completed_today ||
      (task.completed_today && task.last_reset_date !== todayStr);

    console.log(`[CRON-TIMELINE] Task "${task.title}" (${task.user_id}) completed=${task.completed_today} resetDate=${task.last_reset_date} → incomplete=${isIncomplete}`);

    if (isIncomplete) {
      if (!incompleteTasksByUser[task.user_id]) {
        incompleteTasksByUser[task.user_id] = [];
      }
      incompleteTasksByUser[task.user_id].push(task.title);
    }
  });

  const userIds = Object.keys(incompleteTasksByUser);
  console.log(`[CRON-TIMELINE] Users with incomplete tasks: ${userIds.length}`);

  if (userIds.length === 0) {
    console.log('[CRON-TIMELINE] No incomplete tasks found. Exiting early.');
    return NextResponse.json({ success: true, message: 'No incomplete tasks found', sent: 0, skippedTasks });
  }

  // Fetch push subscriptions for those users
  const { data: rawSubscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) {
    console.error('[CRON-TIMELINE] Failed to fetch subscriptions:', subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // ── Zod: validate each subscription row, skip malformed ones ──────────────
  const subscriptions: z.infer<typeof PushSubscriptionRowSchema>[] = [];
  let skippedSubs = 0;
  for (const row of rawSubscriptions || []) {
    const parsed = PushSubscriptionRowSchema.safeParse(row);
    if (parsed.success) {
      subscriptions.push(parsed.data);
    } else {
      skippedSubs++;
      console.warn('[CRON-TIMELINE] Skipping malformed subscription (missing keys):', {
        user_id: (row as any)?.user_id,
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
      // Auto-deactivate subscriptions with missing keys
      if ((row as any)?.endpoint) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', (row as any).endpoint);
      }
    }
  }
  console.log(`[CRON-TIMELINE] Valid subscriptions: ${subscriptions.length}, skipped (malformed): ${skippedSubs}`);
  // ──────────────────────────────────────────────────────────────────────────

  if (subscriptions.length === 0) {
    console.log('[CRON-TIMELINE] No valid push subscriptions found.');
    return NextResponse.json({ success: true, usersWithIncompleteTasks: userIds.length, sent: 0, skippedSubs });
  }

  let sentCount = 0;

  for (const sub of subscriptions) {
    const userId = sub.user_id;
    const missingTasks = incompleteTasksByUser[userId] || [];

    if (missingTasks.length === 0) {
      console.log(`[CRON-TIMELINE] Skipping user ${userId} — no incomplete tasks.`);
      continue;
    }

    const bodyText =
      missingTasks.length <= 3
        ? `You have ${missingTasks.length} task(s) left: ${missingTasks.join(', ')}`
        : `You have ${missingTasks.length} tasks left today. Keep going!`;

    const payload = JSON.stringify({
      title: 'Daily Task Reminder',
      body: bodyText,
      url: '/schedule',
    });

    let safeEndpoint = 'unknown';
    try {
      const epUrl = new URL(sub.endpoint);
      safeEndpoint = `${epUrl.origin}${epUrl.pathname.substring(0, 15)}...`;
    } catch {
      safeEndpoint = sub.endpoint.substring(0, 25) + '...';
    }

    console.log(`[CRON-TIMELINE] Sending push to user ${userId}. Endpoint: ${safeEndpoint}. p256dh: ${sub.p256dh.length}c, auth: ${sub.auth.length}c`);

    try {
      const result = await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sentCount++;
      console.log(`[CRON-TIMELINE] ✅ Push sent to user ${userId}. Status: ${result.statusCode}`);
    } catch (err: any) {
      console.error(`[CRON-TIMELINE] ❌ Push failed for user ${userId}:`, {
        message: err.message,
        statusCode: err.statusCode,
        body: err.body,
        headers: err.headers,
      });

      if (err.statusCode === 410 || err.statusCode === 404) {
        console.warn(`[CRON-TIMELINE] Subscription expired (${err.statusCode}). Deactivating ${safeEndpoint}`);
        const { error: updateErr } = await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', sub.endpoint);

        if (updateErr) {
          console.error(`[CRON-TIMELINE] Failed to deactivate subscription for user ${userId}:`, updateErr);
        }
      }
    }
  }

  console.log(`[CRON-TIMELINE] Finished. Sent ${sentCount}/${subscriptions.length} notifications.`);
  return NextResponse.json({
    success: true,
    usersWithIncompleteTasks: userIds.length,
    sent: sentCount,
    skippedTasks,
    skippedSubs,
  });
}
