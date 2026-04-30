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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Memicu refresh cookie jika sudah hampir kedaluwarsa.
  // getSession sudah cukup untuk memeriksa siapa yang login tanpa harus menyuruh server lock / ping database terus-menerus.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rute-rute yang HANYA boleh diakses oleh user yang sudah login
  const protectedPaths = [
    '/dashboard',
    '/finance',
    '/investments',
    '/timeline',
    '/reminders',
    '/insights',
    '/settings',
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

  return supabaseResponse;
}
