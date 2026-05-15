import type { HomeStep, CompanionSummary } from '@/types';

export const homeSteps: HomeStep[] = [
  {
    title: 'Briefing inicial',
    copy: 'Recogemos necesidades, horario y tipo de acompanamiento en un formulario visual.',
  },
  {
    title: 'Perfilado',
    copy: 'Completas tu perfil con foto, biografia y preferencias de acompanante.',
  },
  {
    title: 'Match inteligente',
    copy: 'Te mostramos perfiles recomendados con valoraciones y especialidad.',
  },
  {
    title: 'Reserva y pago',
    copy: 'El pago se congela hasta que el acompanante acepta la solicitud.',
  },
  {
    title: 'Coordinacion y reporte',
    copy: 'Chat en tiempo real, llamadas seguras y feedback post-servicio.',
  },
];

export const sampleCompanion: CompanionSummary = {
  name: 'Lucia Martinez',
  bio: 'Especialista en acompanamiento cultural y medico',
  rating: '4.9 estrellas',
  years: '2 anos en GoTogether',
  image:
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  alt: 'Acompanante sonriendo',
};
