import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Memicu refresh cookie jika sudah hampir kedaluwarsa.
  // getSession sudah cukup untuk memeriksa siapa yang login tanpa harus menyuruh server lock / ping database terus-menerus.
  let session = null;
  try {
    const {
      data: { session: fetchedSession },
    } = await supabase.auth.getSession();
    session = fetchedSession;
  } catch (error) {
    console.error('[Supabase middleware] auth.getSession failed:', error);
  }

  // Rute-rute yang HANYA boleh diakses oleh user yang sudah login
  const protectedPaths = [
    '/dashboard',
    '/finance',
    '/investments',
    '/timeline',
    '/reminders',
    '/insights',
    '/settings',
    '/sport',
    '/career',
  ];

  const url = request.nextUrl.clone();
  const isProtectedPath = protectedPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  // Jika user belum login dan mencoba mengakses rute terproteksi
  if (!session && isProtectedPath) {
    url.pathname = '/login';
    url.searchParams.set('redirect_to', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Jika user SUDAH login dan mencoba mengakses rute Publik/Auth (contoh: /login)
  const isAuthPath = url.pathname === '/login' || url.pathname === '/signup';
  if (session && isAuthPath) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Jika user SUDAH login dan mengakses root "/" → langsung ke dashboard
  // Ini menghindari landing page compile (29s!) sebelum JS client redirect
  if (session && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
