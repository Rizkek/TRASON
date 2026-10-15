import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getAuthenticatedUser } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called by the service worker on `pushsubscriptionchange`, when the browser rotates an
// endpoint while the app is closed. It authenticates with the session cookie like any other route.
const BodySchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(100),
  userAgent: z.string().max(500).optional(),
  oldEndpoint: z.string().url().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid subscription payload.' }, { status: 400 });
  }

  const { endpoint, p256dh, auth, userAgent, oldEndpoint } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from('push_subscriptions').upsert(
    [
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent ?? null,
        is_active: true,
        failure_count: 0,
        last_error: null,
        last_used_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('[push/subscribe] Upsert failed:', error.message);
    return NextResponse.json({ error: 'Failed to save subscription.' }, { status: 500 });
  }

  if (oldEndpoint && oldEndpoint !== endpoint) {
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', oldEndpoint)
      .eq('user_id', user.id);
  }

  return NextResponse.json({ success: true });
}
