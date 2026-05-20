import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { baseMetadata } from '@/lib/metadata';
import { AppShell } from '@/components/app-shell';
import { QueryProvider } from '@/services/query-provider';
import { Toaster } from 'sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = baseMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={plusJakartaSans.className}>
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
