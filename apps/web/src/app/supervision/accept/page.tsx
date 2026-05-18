'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';
import { acceptInvitation } from '@/services/api';

function AcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<'loading' | 'needsAuth' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Falta el token de invitación.');
      return;
    }

    acceptInvitation(token)
      .then((res) => {
        if (res.needsAuth) {
          setState('needsAuth');
        } else if (res.success) {
          setState('success');
          setMessage(res.message || 'Supervisión aceptada correctamente.');
        } else {
          setState('error');
          setMessage(res.message || 'No se pudo aceptar la invitación.');
        }
      })
      .catch((err: any) => {
        setState('error');
        setMessage(err.message || 'Error al aceptar la invitación.');
      });
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
        <p className="text-gray-500">Procesando invitación...</p>
      </div>
    );
  }

  if (state === 'needsAuth') {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Inicia sesión para aceptar</h1>
        <p className="text-gray-500 text-lg mb-8">
          Necesitas iniciar sesión para aceptar esta invitación de supervisión.
        </p>
        <Button variant="primary" className="h-12 px-8" onClick={() => router.push(`/auth/login?redirect=/supervision/accept?token=${token}`)}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3">¡Supervisión aceptada!</h1>
        <p className="text-gray-500 text-lg mb-8">{message}</p>
        <Button variant="primary" className="h-12 px-8" onClick={() => router.push('/supervision')}>
          Ir a mi Supervisión
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-3xl font-extrabold mb-3">Error</h1>
      <p className="text-gray-500 text-lg mb-8">{message}</p>
      <div className="flex gap-4 justify-center">
        <Button variant="primary" className="h-12 px-8" onClick={() => router.push('/')}>
          Ir al inicio
        </Button>
        <LinkButton href="/auth/login" variant="ghost" className="h-12 px-8">
          Iniciar sesión
        </LinkButton>
      </div>
    </div>
  );
}

export default function AcceptPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-2xl mx-auto">
          <Card className="p-10 border-0 shadow-xl shadow-blue-900/5">
            <Suspense fallback={
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
              </div>
            }>
              <AcceptContent />
            </Suspense>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
