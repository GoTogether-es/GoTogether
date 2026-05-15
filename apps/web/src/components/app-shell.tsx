import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@gotogether/ui';
import { routes } from '@/lib/routes';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div>
      <header style={{ padding: '20px 0' }}>
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            GoTogether
          </Link>
          <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href={routes.briefing}>Briefing</Link>
            <Link href={routes.profiling}>Perfilado</Link>
            <Link href={routes.matching}>Match</Link>
            <Link href={routes.booking}>Reserva</Link>
          </nav>
        </Container>
      </header>
      {children}
    </div>
  );
}
