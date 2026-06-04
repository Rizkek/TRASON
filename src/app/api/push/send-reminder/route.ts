import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// web-push requires Node.js crypto — must not run in Edge runtime
export const runtime = 'nodejs';


// ─── Web Push setup ──────────────────────────────────────────────────────────
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@trason.app';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// ─── Supabase admin client (lazy — created inside handler to avoid build-time errors) ─────
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars for admin client');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {

  try {
    // Validate VAPID config
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured (missing VAPID keys)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { user_id, title, body: notifBody, url, tag } = body;

    if (!user_id || !title) {
      return NextResponse.json({ error: 'Missing user_id or title' }, { status: 400 });
    }

    // Fetch all active push subscriptions for this user
    const supabaseAdmin = getSupabaseAdmin();
    const { data: subs, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (subError) {
      console.error('[push/send-reminder] DB error fetching subscriptions:', subError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No active subscriptions' });
    }

    const payload = JSON.stringify({
      title: `🔔 ${title}`,
      body: notifBody || 'Tap to open TRASON',
      url: url || '/reminders',
      tag: tag || `push-${Date.now()}`,
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Deactivate expired/invalid subscriptions (410 Gone)
    const expiredEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (
        result.status === 'rejected' &&
        (result.reason?.statusCode === 410 || result.reason?.statusCode === 404)
      ) {
        expiredEndpoints.push(subs[i].endpoint);
      }
    });
    if (expiredEndpoints.length > 0) {
      await getSupabaseAdmin()
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('endpoint', expiredEndpoints);
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error('[push/send-reminder] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
