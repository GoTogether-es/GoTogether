import './globals.css';
import { baseMetadata } from '@/lib/metadata';
import { AppShell } from '@/components/app-shell';

export const metadata = baseMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
