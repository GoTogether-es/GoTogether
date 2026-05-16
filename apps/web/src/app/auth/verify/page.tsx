'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState('Verificando tu enlace...');

  useEffect(() => {
    async function handleAuth() {
      // 1. Intentar capturar el hash de la URL (Implicit Flow / Magic Links)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        setStatus('Sincronizando sesión...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          router.push('/perfil?onboarding=true');
          return;
        } else {
          console.error('Error al establecer sesión:', error.message);
          setStatus('Error al validar el token. Redirigiendo al login...');
          setTimeout(() => router.push('/auth/login?error=invalid_token'), 2000);
          return;
        }
      }

      // 2. Si no hay hash, puede que ya se haya procesado. Comprobamos sesión actual.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/perfil?onboarding=true');
        return;
      }

      // 3. Si después de unos segundos no hay nada, damos error de timeout
      const timeout = setTimeout(async () => {
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (!finalSession) {
          setStatus('No se ha detectado ninguna sesión activa. Redirigiendo...');
          router.push('/auth/login?error=timeout');
        } else {
          router.push('/perfil?onboarding=true');
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando acceso</h1>
      <p className="text-gray-600 font-medium">{status}</p>
      <p className="mt-4 text-sm text-gray-400">Si no eres redirigido en unos segundos, intenta iniciar sesión de nuevo.</p>
    </div>
  );
}
