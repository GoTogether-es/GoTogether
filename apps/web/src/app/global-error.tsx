'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
        <div style={{ padding: 40 }}>
          <h1>Ha ocurrido un error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}
