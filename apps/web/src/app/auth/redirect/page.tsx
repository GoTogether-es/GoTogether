'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, syncUser } from '@/services/api';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function AuthRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verificando tu cuenta...');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function decide() {
      try {
        const user = await syncUser();
        if (cancelled) return;

        const profile = await getProfile();
        if (cancelled) return;

        const role = user.role;

        if (profile) {
          if (role === 'SUPERVISOR') {
            router.push('/supervision');
          } else if (role === 'COMPANION') {
            router.push('/panel');
          } else {
            router.push('/perfil');
          }
        } else {
          if (role === 'SUPERVISOR') {
            router.push('/perfil?onboarding=true&role=supervisor');
          } else {
            router.push('/onboarding');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || String(err);
          console.error('[AuthRedirect] Error en verificación:', err);
          setError(msg);
          setErrorDetails(JSON.stringify({
            message: msg,
            name: err?.name,
            stack: err?.stack?.split('\n').slice(0, 3).join('\n'),
          }, null, 2));
          setStatus('Error al verificar tu cuenta');
        }
      }
    }

    decide();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al verificar tu cuenta</h1>
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-lg w-full text-left shadow-sm mt-4">
          <p className="text-red-700 font-bold text-sm mb-1">Mensaje:</p>
          <p className="text-red-600 font-mono text-xs mb-4 bg-red-50 p-2 rounded break-all">{error}</p>
          <p className="text-gray-500 font-bold text-sm mb-1">Detalles:</p>
          <pre className="text-gray-600 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">{errorDetails}</pre>
        </div>
        <button
          onClick={() => router.push('/auth/login')}
          className="mt-6 gt-button gt-button--primary px-6 py-2"
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a GoTogether</h1>
      <p className="text-gray-600">{status}</p>
    </div>
  );
}
