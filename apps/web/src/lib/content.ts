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
    copy: 'El pago es seguro y sólo se libera una vez que el acompañante acepta la solicitud.',
  },
  {
    title: 'Seguimiento y valoración',
    copy: 'Chat en tiempo real durante el servicio y feedback posterior para mejorar la comunidad.',
  },
];

export const infoSteps = [
  {
    title: 'Te registras',
    copy: 'Crea tu perfil en menos de 2 minutos',
  },
  {
    title: 'Definimos necesidades',
    copy: 'Nos cuentas qué tipo de actividades necesitas o puedes ofrecer',
  },
  {
    title: 'Conectamos perfiles',
    copy: 'Te emparejamos con la persona ideal según preferencias',
  },
  {
    title: '¡A disfrutar!',
    copy: 'Realizáis la actividad juntos de forma segura',
  },
];

export type FaqCategory = {
  category: string;
  items: { question: string; answer: string }[];
};

export const faqData: FaqCategory[] = [
  {
    category: 'Sobre GoTogether',
    items: [
      {
        question: '¿Qué es GoTogether?',
        answer:
          'GoTogether es una plataforma que conecta a personas mayores y personas con discapacidad con acompañantes verificados, para que puedan disfrutar de más autonomía, compañía y bienestar en su día a día.',
      },
      {
        question: '¿A quién está dirigido?',
        answer:
          'Está pensado para personas mayores, personas con discapacidad y sus familias, así como para personas que quieran ofrecer acompañamiento de forma remunerada y profesional.',
      },

    ],
  },
  {
    category: 'Los acompañantes',
    items: [
      {
        question: '¿Quiénes son los acompañantes?',
        answer:
          'Son personas verificadas que ofrecen su tiempo y compañía de forma remunerada. Todas pasan por un proceso de validación de identidad y antecedentes antes de poder ofrecer servicios.',
      },
      {
        question: '¿Cómo se eligen?',
        answer:
          'Puedes ver el perfil de cada acompañante, sus valoraciones, intereses y experiencia. Tú eliges con quién quieres compartir tu tiempo, sin compromisos.',
      },
      {
        question: '¿Qué tipo de actividades pueden hacer juntos?',
        answer:
          'Pasear, ir al médico, hacer la compra, conversar, acudir a eventos culturales o simplemente acompañarte en casa. Tú decides el plan.',
      },
    ],
  },
  {
    category: 'Pagos y funcionamiento',
    items: [
      {
        question: '¿Cómo funcionan los pagos?',
        answer:
          'Los pagos se gestionan de forma segura desde la propia plataforma. No es necesario manejar dinero en efectivo durante el acompañamiento.',
      },
      {
        question: '¿Cuánto cuesta?',
        answer:
          'El precio depende del tiempo y tipo de acompañamiento. Verás siempre el coste antes de confirmar cualquier reserva, sin sorpresas ni cargos ocultos.',
      },
    ],
  },
  {
    category: 'Seguridad y privacidad',
    items: [
      {
        question: '¿Cómo garantizáis la seguridad?',
        answer:
          'Verificamos la identidad de todos los acompañantes, contamos con valoraciones mutuas y trazabilidad de cada servicio. La seguridad es nuestra prioridad.',
      },
      {
        question: '¿Qué pasa con mis datos personales?',
        answer:
          'Tus datos se tratan con la máxima confidencialidad y conforme al RGPD. Solo se comparten los necesarios para coordinar el acompañamiento.',
      },
    ],
  },
  {
    category: 'Quiero ser acompañante',
    items: [
      {
        question: '¿Cómo puedo apuntarme como acompañante?',
        answer:
          'Puedes darte de alta desde la propia plataforma seleccionando el perfil de acompañante. Te guiaremos en el proceso de verificación.',
      },
      {
        question: '¿Qué requisitos necesito cumplir?',
        answer:
          'Ser mayor de edad, tener documentación en regla, superar la verificación de identidad y antecedentes, y tener vocación de cuidar y acompañar a otras personas.',
      },
    ],
  },
];

export const sampleCompanion: CompanionSummary = {
  id: 'sample-1',
  profile: {
    fullName: 'Lucía Martínez',
    bio: 'Especialista en acompañamiento cultural y médico',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  specialties: 'Cultura y salud',
  rating: 4.9,
  yearsOnPlatform: 2,
  verified: true,
  completedServices: 47,
};

export const testimonials = [
  {
    name: 'María G.',
    role: 'Cliente',
    text: 'Desde que uso GoTogether voy al médico sin depender de mis hijos. Mi acompañante es un sol.',
    rating: 5,
  },
  {
    name: 'Antonio R.',
    role: 'Familiar',
    text: 'Contraté un acompañante para mi madre de 82 años. Verificados, puntuales y con un trato exquisito.',
    rating: 5,
  },
  {
    name: 'Carmen L.',
    role: 'Cliente',
    text: 'Pensé que sería complicado, pero en 5 minutos tenía reserva. La app es facilísima y el acompañante encantador.',
    rating: 5,
  },
  {
    name: 'Javier M.',
    role: 'Acompañante',
    text: 'Ser acompañante en GoTogether me ha permitido ayudar a personas que lo necesitan y ganar un dinero extra. Muy recomendable.',
    rating: 5,
  },
  {
    name: 'Pilar S.',
    role: 'Cliente',
    text: 'Mi acompañante me ayuda con la compra semanal. Es como tener un amigo que además te echa una mano.',
    rating: 4,
  },
  {
    name: 'Diego F.',
    role: 'Familiar',
    text: 'La función de supervisión me da tranquilidad. Puedo ver dónde está mi padre durante el acompañamiento.',
    rating: 5,
  },
];
