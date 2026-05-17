'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Button } from '@gotogether/ui';
import { routes } from '@/lib/routes';
import { Footer } from './footer';
import { User, LogIn, Menu, Search, CalendarDays, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { logout } from '@/services/api';
import clsx from 'clsx';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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
                <Link
                  href={routes.explorar}
                  className={clsx(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
                    pathname.startsWith(routes.explorar) ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  <Search className="w-4 h-4" />
                  Explorar
                </Link>
                {session && (
                  <Link
                    href={routes.reservas}
                    className={clsx(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
                      pathname.startsWith(routes.reservas) ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Mis Reservas
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {!session ? (
                <Link href={routes.login}>
                  <Button variant="primary" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href={routes.perfil}>
                    <Button variant="secondary" className="flex items-center gap-2 border-gray-200">
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}
              <button
                type="button"
                className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Abrir menú principal"
              >
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
