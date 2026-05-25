'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Page error:', error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-gray-500 text-sm">Ha ocurrido un error al cargar esta página.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="gt-button gt-button--primary text-sm">Reintentar</button>
        <button onClick={() => router.push('/')} className="gt-button gt-button--ghost text-sm">Volver al inicio</button>
      </div>
    </div>
  );
}
