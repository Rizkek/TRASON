import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update session & jalankan aturan redirect (satpam server)
  return await updateSession(request);
}

// Konfigurasi ini memastikan Middleware hanya "terbangun" di rute yang tepat,
// tidak membuang-buang resource server untuk memproses file statis, gambar, atau API
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - biasakan API route jaga JWT nya mandiri)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
