import { Card, Container, Section } from '@gotogether/ui';
import { Heart, ShieldCheck, Users, Target, Eye } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description: 'GoTogether es un equipo comprometido con devolver la autonomía, la compañía y la dignidad a quienes más lo necesitan. Conoce nuestra visión, misión y valores.',
  openGraph: { title: 'Quiénes somos - GoTogether' },
};

const values = [
  {
    icon: Heart,
    title: 'Empatía',
    description: 'Ponemos a las personas en el centro. Cada interacción está guiada por la comprensión, el respeto y el cuidado genuino.',
  },
  {
    icon: ShieldCheck,
    title: 'Confianza',
    description: 'Verificamos la identidad de todos los acompañantes. La seguridad y la transparencia son la base de nuestra plataforma.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Creemos en el poder de la conexión humana. Construimos puentes entre personas que necesitan apoyo y quienes quieren ofrecerlo.',
  },
  {
    icon: Target,
    title: 'Autonomía',
    description: 'Trabajamos para que las personas mayores y con discapacidad ganen independencia y puedan vivir la vida que eligen.',
  },
];

export default function NosotrosPage() {
  return (
    <main>
      <Section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Quiénes somos
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Somos un equipo comprometido con devolver la autonomía, la compañía y la dignidad a quienes más lo necesitan.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Nuestra visión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Un mundo donde ninguna persona se sienta sola. Donde la edad o la discapacidad no sean barreras para disfrutar de una vida plena, activa y conectada con los demás.
              </p>
            </div>

            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Nuestra misión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Conectar a personas mayores y personas con discapacidad con acompañantes verificados para actividades cotidianas, ofreciendo seguridad, flexibilidad y un trato profundamente humano.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nuestros valores</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Principios que guían cada decisión que tomamos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="p-8 border-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">El equipo</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              GoTogether nace de la experiencia personal de sus fundadores con familiares que necesitaban acompañamiento diario. Somos un equipo multidisciplinar con experiencia en tecnología, salud, atención social y economía colaborativa. Operamos desde España con la vocación de expandirnos a más países.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
