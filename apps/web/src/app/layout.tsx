import './globals.css';
import { baseMetadata } from '@/lib/metadata';
import { AppShell } from '@/components/app-shell';
import { Analytics } from '@/components/analytics';
import { QueryProvider } from '@/services/query-provider';
import { Toaster } from 'sonner';

export const metadata = baseMetadata;

const fontUrl =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontUrl} />
      </head>
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
