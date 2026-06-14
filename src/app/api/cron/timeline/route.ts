import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Security check for cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // VAPID Setup
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.com';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch all tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('daily_tasks')
    .select('id, user_id, title, completed_today, last_reset_date')
    .is('deleted_at', null);

  if (tasksError) {
    console.error('Failed to fetch daily tasks:', tasksError);
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  // Group incomplete tasks by user_id
  const incompleteTasksByUser: Record<string, string[]> = {};

  tasks.forEach((task) => {
    // It's incomplete if it is explicitly false, OR if it's true but from a previous day (stale)
    const isIncomplete =
      !task.completed_today ||
      (task.completed_today && task.last_reset_date !== todayStr);

    if (isIncomplete) {
      if (!incompleteTasksByUser[task.user_id]) {
        incompleteTasksByUser[task.user_id] = [];
      }
      incompleteTasksByUser[task.user_id].push(task.title);
    }
  });

  const userIds = Object.keys(incompleteTasksByUser);
  if (userIds.length === 0) {
    return NextResponse.json({ success: true, message: 'No incomplete tasks found', sent: 0 });
  }

  // Fetch push subscriptions for those users
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) {
    console.error('Failed to fetch subscriptions:', subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  let sentCount = 0;

  for (const sub of subscriptions || []) {
    const userId = sub.user_id;
    const missingTasks = incompleteTasksByUser[userId] || [];
    
    if (missingTasks.length === 0) continue;

    // Create dynamic body message
    const bodyText = missingTasks.length <= 3 
      ? `You have ${missingTasks.length} task(s) left: ${missingTasks.join(', ')}`
      : `You have ${missingTasks.length} tasks left today. Keep going!`;

    const payload = JSON.stringify({
      title: `⏳ Timeline Reminder`,
      body: bodyText,
      url: '/timeline'
    });

    try {
      await webpush.sendNotification(
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
    } catch (err: any) {
      console.error(`[CRON] Push failed for user ${userId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Cleanup invalid subscriptions
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', sub.endpoint);
      }
    }
  }

  return NextResponse.json({ success: true, usersWithIncompleteTasks: userIds.length, sent: sentCount });
}
