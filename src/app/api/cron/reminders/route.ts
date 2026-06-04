import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';

// Endpoint ini didesain untuk dipanggil oleh Cron Job (misal: setiap 1 menit)
export async function GET(request: Request) {
  // Keamanan: Cek secret key agar tidak sembarang orang bisa nge-trigger (opsional)
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Gunakan Service Role Key untuk bypass RLS (karena ini berjalan di background, bukan request dari user tertentu)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Setup VAPID keys
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.com';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys missing' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const now = new Date();
  // Kita bulatkan waktu sekarang ke hitungan menit untuk dicocokkan
  const currentEpochMin = Math.floor(now.getTime() / 60000);

  // Ambil semua reminder yang masih pending dan punya due_datetime
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('id, user_id, title, description, due_datetime, notify_times, status')
    .eq('status', 'pending')
    .not('due_datetime', 'is', null);

  if (error) {
    console.error('Failed to fetch reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sentCount = 0;

  // Cek satu per satu apakah ada yang target waktunya JATUH PADA MENIT INI
  for (const r of reminders) {
    const notifyMins: number[] = Array.isArray(r.notify_times) ? r.notify_times : [60, 180, 360];
    const dueTime = new Date(r.due_datetime).getTime();
    
    for (const mins of notifyMins) {
      const notifyTimeMs = dueTime - mins * 60000;
      const notifyEpochMin = Math.floor(notifyTimeMs / 60000);

      // Jika menit target SAMA PERSIS dengan menit sekarang
      if (notifyEpochMin === currentEpochMin) {
        console.log(`[CRON] Due match found! Sending push for "${r.title}" to user ${r.user_id}`);
        
        // Ambil data subscription push untuk user ini
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', r.user_id);

        if (subs && subs.length > 0) {
          const minsBeforeText = mins >= 60 ? `${mins/60}h` : `${mins}m`;
          const payload = JSON.stringify({
            title: `🔔 ${r.title} — ${minsBeforeText} before`,
            body: r.description || 'Tap to open TRASON',
            url: '/reminders'
          });

          for (const sub of subs) {
            try {
              await webpush.sendNotification(sub.subscription, payload);
              sentCount++;
              console.log(`[CRON] ✅ Push sent successfully to subscription`);
            } catch (err: any) {
              console.error(`[CRON] ❌ Push failed:`, err.message);
              // Jika endpoint langganan sudah mati/kadaluwarsa (HTTP 410/404), kita bisa hapus dari DB
              if (err.statusCode === 410 || err.statusCode === 404) {
                await supabase.from('push_subscriptions').delete().eq('subscription->>endpoint', sub.subscription.endpoint);
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, checked: reminders.length, sent: sentCount });
}
