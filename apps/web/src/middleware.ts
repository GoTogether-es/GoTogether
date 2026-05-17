import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Diagnóstico simple para verificar si el middleware responde
  if (request.nextUrl.pathname === '/middleware-health') {
    return NextResponse.json({ status: 'middleware-active', time: new Date().toISOString() });
  }

  try {
    return await updateSession(request)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('MIDDLEWARE CRASH:', err);
    } else {
      console.error('MIDDLEWARE CRASH:', String(err));
    }
    // En caso de error crítico, dejamos pasar la petición para no romper el sitio entero
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
