import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';

// Endpoint ini didesain untuk dipanggil oleh Cron Job (misal: setiap 1 menit)
export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-REMINDERS] [${now.toISOString()}] Route invoked.`);

  // Keamanan: Cek secret key agar tidak sembarang orang bisa nge-trigger (opsional)
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  console.log(`[CRON-REMINDERS] Authorization header present: ${!!authHeader}, Expected secret present: ${!!expectedSecret}`);

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.warn('[CRON-REMINDERS] Unauthorized access attempt: authorization header did not match expected secret.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Gunakan Service Role Key untuk bypass RLS (karena ini berjalan di background, bukan request dari user tertentu)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`[CRON-REMINDERS] Supabase credentials missing! url: ${!!supabaseUrl}, key: ${!!supabaseKey}`);
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Setup VAPID keys
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.com';

  console.log(`[CRON-REMINDERS] VAPID Config - Public Key: ${vapidPublic ? 'Present' : 'MISSING'}, Private Key: ${vapidPrivate ? 'Present' : 'MISSING'}, Email: ${vapidEmail}`);

  if (!vapidPublic || !vapidPrivate) {
    console.error('[CRON-REMINDERS] VAPID keys missing!');
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  // Kita bulatkan waktu sekarang ke hitungan menit untuk dicocokkan
  const currentEpochMin = Math.floor(now.getTime() / 60000);
  console.log(`[CRON-REMINDERS] Current time: ${now.toISOString()}, epoch minutes: ${currentEpochMin}`);

  // Ambil semua reminder yang masih pending dan punya due_datetime
  console.log('[CRON-REMINDERS] Fetching pending reminders with due_datetime...');
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('id, user_id, title, description, due_datetime, notify_times, status')
    .eq('status', 'pending')
    .not('due_datetime', 'is', null);

  if (error) {
    console.error('[CRON-REMINDERS] Failed to fetch reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[CRON-REMINDERS] Fetched ${(reminders || []).length} pending reminders from DB.`);

  let sentCount = 0;

  // Cek satu per satu apakah ada yang target waktunya JATUH PADA MENIT INI
  for (const r of reminders || []) {
    const notifyMins: number[] = Array.isArray(r.notify_times) ? r.notify_times : [60, 180, 360];
    const dueTime = new Date(r.due_datetime).getTime();
    
    console.log(`[CRON-REMINDERS] Checking reminder ID ${r.id} ("${r.title}"). Due time: ${r.due_datetime} (${dueTime} ms). Configured notify minutes before:`, notifyMins);

    for (const mins of notifyMins) {
      const notifyTimeMs = dueTime - mins * 60000;
      const notifyEpochMin = Math.floor(notifyTimeMs / 60000);
      const diffMins = notifyEpochMin - currentEpochMin;

      console.log(`[CRON-REMINDERS]   - Offset ${mins} mins: Target notification epoch minute: ${notifyEpochMin}. Diff: ${diffMins} mins.`);

      // Jika menit target SAMA PERSIS dengan menit sekarang
      if (notifyEpochMin === currentEpochMin) {
        console.log(`[CRON-REMINDERS]   👉 DUE MATCH FOUND! Triggering push for "${r.title}" to user ${r.user_id}`);
        
        // Ambil data subscription push untuk user ini
        const { data: subs, error: subsError } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', r.user_id)
          .eq('is_active', true);

        if (subsError) {
          console.error(`[CRON-REMINDERS] Failed to fetch subscriptions for user ${r.user_id}:`, subsError);
          continue;
        }

        console.log(`[CRON-REMINDERS] Found ${(subs || []).length} active subscriptions for user ${r.user_id}`);

        if (subs && subs.length > 0) {
          const minsBeforeText = mins >= 60 ? `${mins/60}h` : `${mins}m`;
          const payload = JSON.stringify({
            title: `${r.title} — ${minsBeforeText} before`,
            body: r.description || 'Tap to open TRASON',
            url: '/reminders'
          });

          for (const sub of subs) {
            // Helper to log safe endpoint info (last 15 chars or just domain)
            let safeEndpoint = 'unknown';
            try {
              const url = new URL(sub.endpoint);
              safeEndpoint = `${url.origin}${url.pathname.substring(0, 15)}...`;
            } catch {
              safeEndpoint = sub.endpoint ? sub.endpoint.substring(0, 25) + '...' : 'null';
            }

            console.log(`[CRON-REMINDERS] Attempting to send push to subscription.
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
              console.log(`[CRON-REMINDERS] ✅ Push sent successfully to subscription. Response status: ${result.statusCode}`);
            } catch (err: any) {
              console.error(`[CRON-REMINDERS] ❌ Push failed:`, {
                message: err.message,
                statusCode: err.statusCode,
                body: err.body,
                headers: err.headers
              });
              // Jika endpoint langganan sudah mati/kadaluwarsa (HTTP 410/404), kita bisa update is_active
              if (err.statusCode === 410 || err.statusCode === 404) {
                console.warn(`[CRON-REMINDERS] Subscription expired or unsubscribed (status ${err.statusCode}). Marking is_active = false for endpoint ${safeEndpoint}`);
                const { error: updateErr } = await supabase
                  .from('push_subscriptions')
                  .update({ is_active: false })
                  .eq('endpoint', sub.endpoint);
                
                if (updateErr) {
                  console.error(`[CRON-REMINDERS] Failed to deactivate invalid subscription:`, updateErr);
                } else {
                  console.log(`[CRON-REMINDERS] Subscription deactivated successfully.`);
                }
              }
            }
          }
        }
      }
    }
  }

  console.log(`[CRON-REMINDERS] Finished reminders cron run. Total sent: ${sentCount} notifications.`);
  return NextResponse.json({ success: true, checked: reminders.length, sent: sentCount });
}
