export const routes = {
  solicitud: '/solicitud',
  perfil: '/perfil',
  explorar: '/explorar',
  explorarCompanion: (id: string) => `/explorar/${id}`,
  reservas: '/reservas',
  coordinacion: '/coordinacion',
  valoracion: '/valoracion',
  login: '/auth/login',
  onboarding: '/onboarding',
  onboardingSupervisor: '/onboarding/supervisor',
  supervision: '/supervision',
  supervisionAccept: '/supervision/accept',
} as const;
