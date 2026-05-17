'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verificando tu enlace...');
  const [details, setDetails] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const supabase = createClient();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function handleAuth() {
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
          console.error('Error de sesión:', error);
          setDetails('No se pudo validar el token de acceso.');
          setStatus('Error al validar el token.');
          timeout = setTimeout(() => router.push('/auth/login?error=invalid_token'), 4000);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/perfil?onboarding=true');
        return;
      }

      timeout = setTimeout(async () => {
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (!finalSession) {
          setDetails('No se encontró información de sesión.');
          setStatus('No se ha detectado sesión.');
          timeout = setTimeout(() => router.push('/auth/login?error=timeout'), 2000);
        } else {
          router.push('/perfil?onboarding=true');
        }
      }, 3000);
    }

    handleAuth();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6" role="status" aria-label="Cargando"></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando acceso</h1>
      <p className="text-gray-600 font-medium" aria-live="polite">{status}</p>
      {details && <p className="mt-4 text-sm text-red-500 max-w-md">{details}</p>}
      <p className="mt-8 text-sm text-gray-400 italic">Si la página no avanza, intenta iniciar sesión de nuevo solicitando otro correo.</p>
    </div>
  );
}
