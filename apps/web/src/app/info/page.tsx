import { Card, Container, Section } from '@gotogether/ui';
import { AuthLink } from '@/components/auth-link';
import { FaqAccordion } from '@/components/faq-accordion';
import { infoSteps, faqData, testimonials } from '@/lib/content';
import { Heart, ShieldCheck, Sparkles, Smile, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { ScrollToCta } from '@/components/scroll-to-cta';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cómo funciona',
  description: 'Descubre cómo GoTogether conecta a personas mayores y con discapacidad con acompañantes verificados. Seguro, sencillo y humano.',
  openGraph: { title: 'Cómo funciona GoTogether' },
};

const features = [
  {
    icon: Heart,
    title: 'Acompañamiento cercano',
    description: 'Personas empáticas que te acompañan en compras, ocio, eventos o viajes',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad verificada',
    description: 'Todos los acompañantes están verificados con evaluaciones mutuas',
  },
  {
    icon: Sparkles,
    title: 'Actividades variadas',
    description: 'Desde ir al médico hasta disfrutar de un museo o hacer la compra',
  },
  {
    icon: Smile,
    title: 'Impacto humano',
    description: 'Más autonomía, integración social y compañía para una vida plena',
  },
];

const clientBullets = [
  'Más autonomía en tu día a día',
  'Seguridad y confianza',
  'Compañía para salir',
  'Ayuda en gestiones',
];

const companionBullets = [
  'Genera ingresos extras',
  'Crea impacto social',
  'Flexibilidad horaria',
  'Formación incluida',
];

export default function InfoPage() {
  return (
    <main>
      <Section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Acompañamiento humano para vivir con más autonomía
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Conecta con acompañantes empáticos y verificados para actividades cotidianas o de ocio
            </p>
            <AuthLink className="gt-button gt-button--primary h-14 px-10 text-lg inline-flex items-center">
              Empezar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </AuthLink>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">¿Qué es GoTogether?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Una plataforma que conecta a personas con discapacidad y mayores con acompañantes verificados para cualquier actividad
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
              <h2 className="text-3xl font-bold mb-4">Elige tu perfil</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                ¿Necesitas acompañamiento o quieres acompañar?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                  Para ti
                </span>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Personas acompañadas</h3>
                <p className="text-gray-500 mb-6">Para personas mayores o con discapacidad</p>
                <ul className="space-y-3 mb-8">
                  {clientBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ScrollToCta variant="primary" className="w-full">
                  Quiero acompañamiento
                </ScrollToCta>
              </Card>

              <Card className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-6">
                  Colabora
                </span>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Acompañantes</h3>
                <p className="text-gray-500 mb-6">Para personas que quieran acompañar</p>
                <ul className="space-y-3 mb-8">
                  {companionBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ScrollToCta variant="secondary" className="w-full">
                  Quiero ser acompañante
                </ScrollToCta>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Simple, rápido y seguro. En 4 pasos estarás listo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {infoSteps.map((step, i) => (
                <div key={step.title} className="relative group">
                  <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 border-gray-50">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {String(i + 1).padStart(2, '0')}
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
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-gray-500 text-lg">Historias reales de personas que ya confían en GoTogether</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.slice(0, 6).map((t) => (
              <Card key={t.name} className="p-6 border-gray-50 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Resolvemos las dudas más comunes sobre GoTogether
              </p>
            </div>
            <div className="space-y-12">
              {faqData.map((category) => (
                <div key={category.category}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h3>
                  <FaqAccordion items={category.items} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white" id="final-cta">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Únete a GoTogether y descubre una nueva forma de vivir con más autonomía y compañía.
            </p>
            <AuthLink className="gt-button gt-button--primary h-14 px-10 text-lg inline-flex items-center">
              Empezar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </AuthLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
