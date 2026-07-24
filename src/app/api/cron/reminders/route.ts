import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-REMINDERS] [${now.toISOString()}] Route invoked.`);

  // Validate Secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
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

  // VAPID Setup
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.app';

  if (!vapidPublic || !vapidPrivate) {
    console.error('[CRON-REMINDERS] VAPID keys missing!');
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch pending reminders due today or overdue
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, user_id, title, due_time')
    .eq('status', 'pending')
    .lte('due_date', todayStr)
    .is('deleted_at', null);

  if (remindersError) {
    console.error('[CRON-REMINDERS] Failed to fetch reminders:', remindersError);
    return NextResponse.json({ error: remindersError.message }, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    console.log('[CRON-REMINDERS] No pending reminders today.');
    return NextResponse.json({ success: true, sent: 0, message: 'No pending reminders' });
  }

  // Group by user_id
  const remindersByUser: Record<string, typeof reminders> = {};
  reminders.forEach((r) => {
    if (!remindersByUser[r.user_id]) remindersByUser[r.user_id] = [];
    remindersByUser[r.user_id].push(r);
  });

  const userIds = Object.keys(remindersByUser);
  console.log(`[CRON-REMINDERS] Found ${reminders.length} reminders for ${userIds.length} users.`);

  // Fetch push subscriptions for those users
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (subError) {
    console.error('[CRON-REMINDERS] Failed to fetch subscriptions:', subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  let sentCount = 0;

  for (const sub of subscriptions || []) {
    const userId = sub.user_id;
    const userReminders = remindersByUser[userId] || [];
    
    if (userReminders.length === 0) continue;

    // Build notification content
    const title = 'TRASON Reminders';
    let bodyText = '';
    
    if (userReminders.length === 1) {
      bodyText = `${userReminders[0].title}${userReminders[0].due_time ? ` at ${userReminders[0].due_time}` : ''}`;
    } else if (userReminders.length <= 3) {
      bodyText = `You have ${userReminders.length} reminders: ${userReminders.map(r => r.title).join(', ')}`;
    } else {
      bodyText = `You have ${userReminders.length} pending reminders due today.`;
    }

    const payload = JSON.stringify({
      title,
      body: bodyText,
      url: '/reminders',
      tag: `reminders-daily-${todayStr}`
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
      console.error(`[CRON-REMINDERS] Push failed for user ${userId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', sub.endpoint);
      }
    }
  }

  console.log(`[CRON-REMINDERS] Finished run. Sent ${sentCount} notifications.`);
  return NextResponse.json({ success: true, processedUsers: userIds.length, sent: sentCount });
}
