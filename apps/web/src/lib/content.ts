import type { HomeStep, CompanionSummary } from '@/types';

export const homeSteps: HomeStep[] = [
  {
    title: 'Cuéntanos qué necesitas',
    copy: 'Recogemos tus necesidades, horarios y tipo de acompañamiento en un formulario sencillo.',
  },
  {
    title: 'Completa tu perfil',
    copy: 'Añade tu foto, biografía y preferencias para que podamos conocerte mejor.',
  },
  {
    title: 'Explora acompañantes',
    copy: 'Te mostramos perfiles verificados con valoraciones y especialidades compatibles.',
  },
  {
    title: 'Reserva con garantía',
    copy: 'El pago es seguro y solo se libera una vez que el acompañante acepta la solicitud.',
  },
  {
    title: 'Seguimiento y valoración',
    copy: 'Chat en tiempo real durante el servicio y feedback posterior para mejorar la comunidad.',
  },
];

export const sampleCompanion: CompanionSummary = {
  id: 'sample-1',
  name: 'Lucía Martínez',
  bio: 'Especialista en acompañamiento cultural y médico',
  specialties: 'Cultura y salud',
  rating: 4.9,
  yearsOnPlatform: 2,
  verified: true,
  image:
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  alt: 'Acompañante sonriendo',
};
