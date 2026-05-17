import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = [
  '/solicitud',
  '/perfil',
  '/reservas',
  '/coordinacion',
  '/valoracion',
  '/supervision',
]

const PUBLIC_ROUTES = [
  '/',
  '/explorar',
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/middleware-health',
]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/middleware-health') {
    return NextResponse.json({ status: 'middleware-active', time: new Date().toISOString() })
  }

  try {
    const response = await updateSession(request)

    if (isProtectedRoute(pathname)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        const { createServerClient } = await import('@supabase/ssr')
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {},
          },
        })

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          const loginUrl = new URL('/auth/login', request.url)
          loginUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(loginUrl)
        }
      }
    }

    return response
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('MIDDLEWARE CRASH:', err.message)
    } else {
      console.error('MIDDLEWARE CRASH:', String(err))
    }

    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
