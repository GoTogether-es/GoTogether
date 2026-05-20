import { Card, Container, Section } from '@gotogether/ui';
import { AuthLink } from '@/components/auth-link';
import { Search, FileText, MessageSquare, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Primeros pasos',
  description: 'Guía rápida para empezar a usar GoTogether. Crea tu perfil, busca acompañante y disfruta.',
};

const steps = [
  {
    icon: FileText,
    title: '1. Completa tu perfil',
    text: 'Ve a tu perfil y añade tu foto, nombre y preferencias. Cuanta más información, mejor podremos emparejarte.',
  },
  {
    icon: Search,
    title: '2. Explora acompañantes',
    text: 'Busca acompañantes verificados por especialidad o tipo de discapacidad. Lee sus valoraciones y elige el que mejor encaje.',
  },
  {
    icon: FileText,
    title: '3. Crea una solicitud',
    text: 'Dinos qué necesitas, cuándo y dónde. En minutos tendrás un acompañante asignado.',
  },
  {
    icon: MessageSquare,
    title: '4. Chatea con tu acompañante',
    text: 'Una vez aceptada la reserva, puedes hablar por chat para coordinar los detalles.',
  },
  {
    icon: Star,
    title: '5. Valora el servicio',
    text: 'Al terminar, valora a tu acompañante. Tu opinión ayuda a mantener la calidad de la comunidad.',
  },
];

export default function PrimerosPasosPage() {
  return (
    <main>
      <Section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Tus primeros pasos en GoTogether
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Bienvenido. En 5 pasos estarás disfrutando de la compañía que necesitas.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((step) => (
              <Card key={step.title} className="p-8 border-gray-50 hover:shadow-lg transition-shadow flex gap-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-gray-500 text-lg mb-8">
              Crea tu cuenta gratis y descubre una nueva forma de vivir con más autonomía.
            </p>
            <AuthLink className="gt-button gt-button--primary h-14 px-10 text-lg inline-flex items-center">
              Empezar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </AuthLink>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sin permanencia
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Pago seguro
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Acompañantes verificados
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
