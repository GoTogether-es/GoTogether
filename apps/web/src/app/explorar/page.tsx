import { Container, Section } from '@gotogether/ui';
import { CompanionCard } from '@/components/companion-card';
import type { CompanionSummary } from '@/types';

const companions: Omit<CompanionSummary, 'image'>[] = [
  {
    name: 'Lucía Martínez',
    bio: 'Acompaño a personas mayores en paseos culturales y gestiones médicas.',
    specialty: 'Cultura y salud',
    rating: '4.9',
    years: '2 años en GoTogether',
  },
  {
    name: 'Alberto Gil',
    bio: 'Soy paciente y atento, con experiencia en movilidad reducida.',
    specialty: 'Movilidad y hogar',
    rating: '4.8',
    years: '1 año en GoTogether',
  },
  {
    name: 'Rocío Vega',
    bio: 'Disfruto acompañando en actividades sociales y compras.',
    specialty: 'Ocio y compras',
    rating: '5.0',
    years: '3 años en GoTogether',
  },
];

const companionImage =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80';

export default function ExplorarPage() {
  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-bold mb-2">Encuentra a tu acompañante ideal</h1>
        <p className="text-gray-500 mb-8 max-w-2xl">
          Selecciona el perfil que mejor encaje con tus necesidades. Todos nuestros acompañantes han pasado un proceso de validación.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companions.map((companion) => (
            <CompanionCard key={companion.name} {...companion} image={companionImage} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
