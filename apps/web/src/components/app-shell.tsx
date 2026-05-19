'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Button } from '@gotogether/ui';
import { routes } from '@/lib/routes';
import { Footer } from './footer';
import { NotificationBell } from './notification-bell';
import { ConfirmDialog } from './confirm-dialog';
import { RouteAnnouncer } from './route-announcer';
import { User, LogIn, Menu, X, Search, CalendarDays, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logout as apiLogout, getProfile } from '@/services/api';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import clsx from 'clsx';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isCompanion, setIsCompanion] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const profile = await getProfile().catch(() => null);
        setIsCompanion(!!profile?.companion);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        getProfile().then(profile => setIsCompanion(!!profile?.companion)).catch(() => {});
      } else {
        setIsCompanion(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen, closeMenu]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
      router.push('/');
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
                GoTogether
              </Link>

              <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
                {isCompanion ? (
                  <Link
                    href={routes.panel}
                    className={clsx(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
                      isActive(routes.panel) ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                  </Link>
                ) : (
                  <Link
                    href={routes.explorar}
                    className={clsx(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
                      isActive(routes.explorar) ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    <Search className="w-4 h-4" />
                    Explorar
                  </Link>
                )}
                {session && (
                  <Link
                    href={routes.reservas}
                    className={clsx(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600',
                      isActive(routes.reservas) ? 'text-blue-600' : 'text-gray-500'
                    )}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Mis Reservas
                  </Link>
                )}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {!session ? (
                <Link href={routes.login}>
                  <Button variant="primary" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </Link>
              ) : (
                <>
                  <NotificationBell />
                  <Link href={routes.perfil}>
                    <Button variant="secondary" className="flex items-center gap-2 border-gray-200">
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600"
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={loggingOut}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </>
              )}
            </div>

            <button
              ref={buttonRef}
              type="button"
              className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-black/20 md:hidden" aria-hidden="true" onClick={closeMenu} />
      )}

      <div
        ref={menuRef}
        className={clsx(
          'fixed top-20 inset-x-0 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <Container>
          <nav className="py-6 flex flex-col gap-1" aria-label="Menú móvil">
            {isCompanion ? (
              <Link
                href={routes.panel}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive(routes.panel)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={closeMenu}
              >
                <LayoutDashboard className="w-5 h-5" />
                Panel
              </Link>
            ) : (
              <Link
                href={routes.explorar}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive(routes.explorar)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={closeMenu}
              >
                <Search className="w-5 h-5" />
                Explorar
              </Link>
            )}
            {session && (
              <>
                <Link
                  href={routes.reservas}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive(routes.reservas)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={closeMenu}
                >
                  <CalendarDays className="w-5 h-5" />
                  Mis Reservas
                </Link>
                <Link
                  href={routes.perfil}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive(routes.perfil)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={closeMenu}
                >
                  <User className="w-5 h-5" />
                  Mi Perfil
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  onClick={() => {
                    closeMenu();
                    setShowLogoutConfirm(true);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </>
            )}
            {!session && (
              <Link
                href={routes.login}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={closeMenu}
              >
                <LogIn className="w-5 h-5" />
                Iniciar sesión
              </Link>
            )}
          </nav>
        </Container>
      </div>

      <main id="main-content" className="flex-grow">{children}</main>

      <Footer />

      <RouteAnnouncer />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
