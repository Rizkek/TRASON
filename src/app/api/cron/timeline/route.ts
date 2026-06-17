import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-TIMELINE] [${now.toISOString()}] Route invoked.`);

  // Security check for cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  console.log(`[CRON-TIMELINE] Authorization header present: ${!!authHeader}, Expected secret present: ${!!expectedSecret}`);

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.warn('[CRON-TIMELINE] Unauthorized access attempt: authorization header did not match expected secret.');
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
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.com';

  console.log(`[CRON-TIMELINE] VAPID Config - Public Key: ${vapidPublic ? 'Present' : 'MISSING'}, Private Key: ${vapidPrivate ? 'Present' : 'MISSING'}, Email: ${vapidEmail}`);

  if (!vapidPublic || !vapidPrivate) {
    console.error('[CRON-TIMELINE] VAPID keys missing!');
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`[CRON-TIMELINE] Querying daily tasks for target date context: ${todayStr}`);

  // Fetch all tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('daily_tasks')
    .select('id, user_id, title, completed_today, last_reset_date')
    .is('deleted_at', null);

  if (tasksError) {
    console.error('[CRON-TIMELINE] Failed to fetch daily tasks:', tasksError);
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  console.log(`[CRON-TIMELINE] Fetched ${(tasks || []).length} total active daily tasks from DB.`);

  // Group incomplete tasks by user_id
  const incompleteTasksByUser: Record<string, string[]> = {};

  (tasks || []).forEach((task) => {
    // It's incomplete if it is explicitly false, OR if it's true but from a previous day (stale)
    const isIncomplete =
      !task.completed_today ||
      (task.completed_today && task.last_reset_date !== todayStr);

    console.log(`[CRON-TIMELINE] Task ID: ${task.id}, Title: "${task.title}", User: ${task.user_id}, CompletedToday: ${task.completed_today}, LastResetDate: ${task.last_reset_date} -> IsIncomplete: ${isIncomplete}`);

    if (isIncomplete) {
      if (!incompleteTasksByUser[task.user_id]) {
        incompleteTasksByUser[task.user_id] = [];
      }
      incompleteTasksByUser[task.user_id].push(task.title);
    }
  });

  const userIds = Object.keys(incompleteTasksByUser);
  console.log(`[CRON-TIMELINE] Users with incomplete tasks:`, userIds);

  if (userIds.length === 0) {
    console.log('[CRON-TIMELINE] No incomplete tasks found. Exiting early.');
    return NextResponse.json({ success: true, message: 'No incomplete tasks found', sent: 0 });
  }

  // Fetch push subscriptions for those users
  console.log(`[CRON-TIMELINE] Fetching active subscriptions for users:`, userIds);
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) {
    console.error('[CRON-TIMELINE] Failed to fetch subscriptions:', subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  console.log(`[CRON-TIMELINE] Fetched ${(subscriptions || []).length} active push subscriptions for targeted users.`);

  let sentCount = 0;

  for (const sub of subscriptions || []) {
    const userId = sub.user_id;
    const missingTasks = incompleteTasksByUser[userId] || [];
    
    if (missingTasks.length === 0) {
      console.log(`[CRON-TIMELINE] Skipping subscription for user ${userId} because missingTasks length is 0`);
      continue;
    }

    // Create dynamic body message
    const bodyText = missingTasks.length <= 3 
      ? `You have ${missingTasks.length} task(s) left: ${missingTasks.join(', ')}`
      : `You have ${missingTasks.length} tasks left today. Keep going!`;

    const payload = JSON.stringify({
      title: `Timeline Reminder`,
      body: bodyText,
      url: '/timeline'
    });

    // Helper to log safe endpoint info (last 15 chars or just domain)
    let safeEndpoint = 'unknown';
    try {
      const url = new URL(sub.endpoint);
      safeEndpoint = `${url.origin}${url.pathname.substring(0, 15)}...`;
    } catch {
      safeEndpoint = sub.endpoint ? sub.endpoint.substring(0, 25) + '...' : 'null';
    }

    console.log(`[CRON-TIMELINE] Attempting to send push to User ${userId}.
      Endpoint: ${safeEndpoint}
      Keys: p256dh length: ${sub.p256dh?.length || 0}, auth length: ${sub.auth?.length || 0}
      Payload: ${payload}`);

    try {
      const result = await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
      sentCount++;
      console.log(`[CRON-TIMELINE] ✅ Push sent successfully to User ${userId}. Response status: ${result.statusCode}`);
    } catch (err: any) {
      console.error(`[CRON-TIMELINE] ❌ Push failed for user ${userId}:`, {
        message: err.message,
        statusCode: err.statusCode,
        body: err.body,
        headers: err.headers
      });
      
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.warn(`[CRON-TIMELINE] Subscription expired or unsubscribed (status ${err.statusCode}). Marking is_active = false for endpoint ${safeEndpoint}`);
        // Cleanup invalid subscriptions
        const { error: updateErr } = await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', sub.endpoint);
          
        if (updateErr) {
          console.error(`[CRON-TIMELINE] Failed to deactivate invalid subscription for user ${userId}:`, updateErr);
        } else {
          console.log(`[CRON-TIMELINE] Subscription deactivated successfully for user ${userId}.`);
        }
      }
    }
  }

  console.log(`[CRON-TIMELINE] Finished timeline cron run. Total sent: ${sentCount} notifications.`);
  return NextResponse.json({ success: true, usersWithIncompleteTasks: userIds.length, sent: sentCount });
}
