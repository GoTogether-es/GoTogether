'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase automáticamente procesa el #access_token de la URL
    // al inicializarse el cliente en el navegador.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Una vez logueado, redirigimos al perfil con el flag de onboarding
        router.push('/perfil?onboarding=true');
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      }
    });

    // Timeout de seguridad por si no hay token o falla
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push('/auth/login?error=timeout');
        } else {
          router.push('/perfil?onboarding=true');
        }
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando tu acceso</h1>
      <p className="text-gray-600">Espera un momento mientras validamos tu enlace...</p>
    </div>
  );
}
