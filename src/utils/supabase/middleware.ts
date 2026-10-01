import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Public pages must never depend on the backend being configured.
  // Without credentials there is no session to read, so skip auth routing.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase middleware] Missing env vars; skipping session routing.');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        async setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );

  const protectedPaths = [
    '/dashboard',
    '/finance',
    '/investments',
    '/schedule',
    '/timeline',
    '/reminders',
    '/insights',
    '/settings',
    '/sport',
    '/career',
    '/onboarding',
  ];

  const url = request.nextUrl.clone();
  const isProtectedPath = protectedPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const isAuthPath = url.pathname === '/login' || url.pathname === '/signup';
  const isRootPath = url.pathname === '/';

  // Optimization: Only ping Supabase if it's a route that cares about auth state
  // OR if they might have a session (they have cookies).
  const needsAuthCheck = isProtectedPath || isAuthPath || isRootPath;

  let session = null;
  if (needsAuthCheck) {
    try {
      const {
        data: { session: fetchedSession },
      } = await supabase.auth.getSession();
      session = fetchedSession;
    } catch (error) {
      console.error('[Supabase middleware] auth.getSession failed:', error);
    }
  }

  // Jika user belum login dan mencoba mengakses rute terproteksi
  if (!session && isProtectedPath) {
    url.pathname = '/login';
    url.searchParams.set('redirect_to', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Jika user SUDAH login dan mencoba mengakses rute Publik/Auth (contoh: /login)
  if (session && isAuthPath) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Jika user SUDAH login dan mengakses root "/" → langsung ke dashboard
  if (session && isRootPath) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
