import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/perfil?onboarding=true'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si no hay código, puede ser un login basado en fragmentos (#access_token=...)
  // El servidor no puede leer fragmentos, así que devolvemos un pequeño script
  // para que el cliente decida qué hacer.
  return new Response(
    `<html>
      <head>
        <title>Verificando autenticación...</title>
      </head>
      <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f9fafb; color: #111827;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <h1 style="margin-top: 20px; font-size: 1.25rem;">Procesando acceso...</h1>
        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
        <script>
          // Si hay un token en el fragmento, vamos a la página de verificación del cliente
          if (window.location.hash.includes('access_token=')) {
            window.location.href = '${origin}/auth/verify' + window.location.hash;
          } else {
            // Si realmente no hay nada, entonces sí mostramos el error
            window.location.href = '${origin}/auth/auth-code-error';
          }
        </script>
      </body>
    </html>`,
    { 
      headers: { 
        'Content-Type': 'text/html',
        // Evitamos caché para que el script siempre se ejecute
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      } 
    }
  );
}
