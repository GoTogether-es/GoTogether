export const routes = {
  solicitud: '/solicitud',
  perfil: '/perfil',
  explorar: '/explorar',
  explorarCompanion: (id: string) => `/explorar/${id}`,
  reservas: '/reservas',
  coordinacion: '/coordinacion',
  valoracion: '/valoracion',
  login: '/auth/login',
} as const;
