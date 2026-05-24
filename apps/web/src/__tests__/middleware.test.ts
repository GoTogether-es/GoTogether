const PROTECTED_ROUTES = [
  '/onboarding',
  '/solicitud',
  '/perfil',
  '/reservas',
  '/coordinacion',
  '/valoracion',
  '/supervision',
  '/panel',
  '/historial',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

describe('middleware route rules', () => {
  describe('PROTECTED_ROUTES', () => {
    it('protects /perfil', () => expect(isProtectedRoute('/perfil')).toBe(true));
    it('protects /reservas', () => expect(isProtectedRoute('/reservas')).toBe(true));
    it('protects /solicitud', () => expect(isProtectedRoute('/solicitud')).toBe(true));
    it('protects /onboarding', () => expect(isProtectedRoute('/onboarding')).toBe(true));
    it('protects /panel', () => expect(isProtectedRoute('/panel')).toBe(true));
    it('protects /supervision', () => expect(isProtectedRoute('/supervision')).toBe(true));
    it('protects /historial', () => expect(isProtectedRoute('/historial')).toBe(true));
    it('protects /coordinacion', () => expect(isProtectedRoute('/coordinacion')).toBe(true));
    it('protects /valoracion', () => expect(isProtectedRoute('/valoracion')).toBe(true));
    it('protects sub-routes', () => expect(isProtectedRoute('/onboarding/register/client')).toBe(true));
  });

  it('does NOT protect public routes', () => {
    expect(isProtectedRoute('/')).toBe(false);
    expect(isProtectedRoute('/info')).toBe(false);
    expect(isProtectedRoute('/explorar')).toBe(false);
    expect(isProtectedRoute('/nosotros')).toBe(false);
    expect(isProtectedRoute('/contacto')).toBe(false);
    expect(isProtectedRoute('/primeros-pasos')).toBe(false);
    expect(isProtectedRoute('/auth/login')).toBe(false);
    expect(isProtectedRoute('/legal/privacy')).toBe(false);
  });

  it('has matcher config that excludes static files', () => {
    const matcher = '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)';
    expect(matcher).toContain('_next/static');
    expect(matcher).toContain('_next/image');
    expect(matcher).toContain('favicon.ico');
  });
});
