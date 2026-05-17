import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? searchParams.get('redirect')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectCookie = request.headers.get('cookie')?.split(';').find((c) => c.trim().startsWith('gotogether-auth-redirect='))
      let redirectUrl = next ?? '/perfil?onboarding=true'
      if (redirectCookie) {
        const cookieValue = decodeURIComponent(redirectCookie.split('=')[1])
        if (cookieValue && cookieValue.startsWith('/')) {
          redirectUrl = cookieValue
        }
      }
      const response = NextResponse.redirect(`${origin}${redirectUrl}`)
      response.cookies.set('gotogether-auth-redirect', '', { path: '/', maxAge: 0 })
      return response
    }
  }

  const html = `<!DOCTYPE html>
<html>
  <head><title>Verificando autenticación...</title></head>
  <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f9fafb;color:#111827">
    <div style="border:4px solid #f3f3f3;border-top:4px solid #3b82f6;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite"></div>
    <h1 style="margin-top:20px;font-size:1.25rem">Procesando acceso...</h1>
    <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
    <script>
      (function() {
        var o = location.origin;
        if (location.hash.indexOf('access_token=') > -1) {
          location.href = o + '/auth/verify' + location.hash;
        } else {
          location.href = o + '/auth/login?error=auth_code_error';
        }
      })();
    </script>
  </body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  })
}
