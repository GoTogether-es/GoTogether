'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, syncUser } from '@/services/api';
import { Loader2 } from 'lucide-react';

export default function AuthRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verificando tu cuenta...');

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
      } catch {
        if (!cancelled) {
          setStatus('Error al verificar tu cuenta. Redirigiendo...');
          setTimeout(() => router.push('/auth/login'), 1500);
        }
      }
    }

    decide();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a GoTogether</h1>
      <p className="text-gray-600">{status}</p>
    </div>
  );
}
