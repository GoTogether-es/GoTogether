import { Container, Section } from '@gotogether/ui';
import { CompanionCard } from '@/components/companion-card';
import type { CompanionSummary } from '@/types';

const companions: Omit<CompanionSummary, 'image'>[] = [
  {
    name: 'Lucia Martinez',
    bio: 'Acompano a personas mayores en paseos culturales y gestiones medicas.',
    specialty: 'Cultura y salud',
    rating: '4.9',
    years: '2 anos en GoTogether',
  },
  {
    name: 'Alberto Gil',
    bio: 'Soy paciente y atento, con experiencia en movilidad reducida.',
    specialty: 'Movilidad y hogar',
    rating: '4.8',
    years: '1 ano en GoTogether',
  },
  {
    name: 'Rocio Vega',
    bio: 'Disfruto acompanando en actividades sociales y compras.',
    specialty: 'Ocio y compras',
    rating: '5.0',
    years: '3 anos en GoTogether',
  },
];

const companionImage =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80';

export default function MatchingPage() {
  return (
    <Section>
      <Container>
        <h1>Match inteligente</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          Selecciona el perfil que mejor encaja. La foto y la historia personal son el
          protagonista.
        </p>
        <div className="gt-grid gt-grid-3" style={{ marginTop: 32 }}>
          {companions.map((companion) => (
            <CompanionCard key={companion.name} {...companion} image={companionImage} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
