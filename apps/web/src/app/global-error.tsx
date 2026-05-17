'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error.digest || 'unknown');
  }, [error]);

  return (
    <html lang="es">
      <body style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', margin: 0, background: '#f9fafb' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', maxWidth: '480px', width: '100%' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Ha ocurrido un error inesperado</h1>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
              Estamos trabajando para solucionarlo. Por favor, inténtalo de nuevo.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#0077b6',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,119,182,0.3)',
              }}
            >
              Reintentar
            </button>
            <p style={{ marginTop: '24px', fontSize: '0.875rem', color: '#9ca3af' }}>
              <a href="/" style={{ color: '#0077b6', textDecoration: 'none' }}>Volver al inicio</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
