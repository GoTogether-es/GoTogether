'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button } from '@gotogether/ui';
import { routes } from '@/lib/routes';
import { Footer } from './footer';
import { User, LogIn, Menu } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Briefing', href: routes.briefing },
  { label: 'Perfilado', href: routes.profiling },
  { label: 'Match', href: routes.matching },
  { label: 'Reserva', href: routes.booking },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
                GoTogether
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'text-sm font-medium transition-colors hover:text-blue-600',
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {item.label}
                      {isActive && (
                        <span className="block h-0.5 w-full bg-blue-600 rounded-full mt-0.5" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
              </Link>
              <Button variant="primary" className="hidden sm:flex items-center gap-2">
                <User className="w-4 h-4" />
                Mi Perfil
              </Button>
              <button className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
}
