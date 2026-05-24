import { routes } from '@/lib/routes';

describe('routes', () => {
  it('has all static route constants', () => {
    expect(routes.info).toBe('/info');
    expect(routes.nosotros).toBe('/nosotros');
    expect(routes.contacto).toBe('/contacto');
    expect(routes.solicitud).toBe('/solicitud');
    expect(routes.perfil).toBe('/perfil');
    expect(routes.explorar).toBe('/explorar');
    expect(routes.reservas).toBe('/reservas');
    expect(routes.panel).toBe('/panel');
    expect(routes.login).toBe('/auth/login');
    expect(routes.onboarding).toBe('/onboarding');
    expect(routes.admin).toBe('/admin');
    expect(routes.historial).toBe('/historial');
  });

  it('explorarCompanion builds dynamic route', () => {
    expect(routes.explorarCompanion('comp-123')).toBe('/explorar/comp-123');
  });
});
