import { Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { homeSteps } from '@/lib/content';
import { routes } from '@/lib/routes';
import { ShieldCheck, Users, Clock, CreditCard, Heart, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Seguridad certificada',
    description: 'Todos los acompañantes pasan por un proceso de verificación de identidad y certificado de antecedentes.',
  },
  {
    icon: Users,
    title: 'Conexión humana',
    description: 'Emparejamos a cada cliente con el acompañante más adecuado según sus necesidades, preferencias y ubicación.',
  },
  {
    icon: Clock,
    title: 'Flexibilidad total',
    description: 'Tú eliges cuándo y para qué necesitas acompañamiento. Sin compromisos de permanencia ni horarios fijos.',
  },
  {
    icon: CreditCard,
    title: 'Pago seguro',
    description: 'El pago se retiene de forma segura y solo se libera cuando el servicio se ha completado satisfactoriamente.',
  },
];

const audiences = [
  {
    icon: Heart,
    title: 'Para personas mayores y personas con discapacidad',
    description:
      'Recupera tu autonomía con un acompañante de confianza para ir al médico, hacer la compra, pasear o simplemente compartir una conversación. Tú decides qué necesitas y cuándo.',
  },
  {
    icon: Star,
    title: 'Para acompañantes',
    description:
      'Convierte tu empatía y tiempo en una fuente de ingresos extra. Recibirás formación especializada, seguro de responsabilidad civil y el respaldo de una comunidad que valora tu labor.',
  },
];

export default function InfoPage() {
  return (
    <main>
      <Section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-sm font-semibold backdrop-blur-sm mb-6">
              <ShieldCheck className="w-4 h-4" />
              Cómo funciona GoTogether
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Acompañamiento humano para vivir con más autonomía
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              GoTogether conecta a personas que necesitan apoyo en su día a día con acompañantes verificados y
              empáticos. Tecnología al servicio de las personas.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">¿Qué es GoTogether?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Una plataforma digital que conecta a <strong>personas mayores y personas con discapacidad</strong>{' '}
                con <strong>acompañantes verificados</strong> para actividades cotidianas: ir al médico, hacer la
                compra, gestiones administrativas, paseos, ocio o simplemente compañía. Porque nadie debería
                sentirse solo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="p-8 border-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Un proceso sencillo en cinco pasos, diseñado para que te sientas seguro en cada momento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {homeSteps.map((step, i) => (
                <div key={step.title} className="relative group">
                  <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 border-gray-50">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.copy}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">¿Para quién es GoTogether?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Dos caras de una misma moneda: personas que necesitan apoyo y personas que quieren ofrecerlo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {audiences.map((audience) => (
                <Card
                  key={audience.title}
                  className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <audience.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{audience.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{audience.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
              Crea tu cuenta gratis y descubre cómo GoTogether puede ayudarte a ti o a un ser querido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href={routes.login} className="h-14 px-8 text-lg">
                Crear cuenta gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </LinkButton>
              <LinkButton href={routes.explorar} variant="secondary" className="h-14 px-8 text-lg border-2">
                Explorar acompañantes
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
