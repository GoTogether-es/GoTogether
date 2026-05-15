import { Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { homeSteps, sampleCompanion } from '@/lib/content';
import { routes } from '@/lib/routes';
import { CheckCircle2, ArrowRight, Star, ShieldCheck, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
        <Container className="py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-sm font-semibold backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" />
                Confianza y Seguridad Certificada
              </span>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Acompañamiento humano para vivir con más autonomía
              </h1>
              <p className="text-xl text-blue-100 max-w-xl leading-relaxed">
                Conecta con acompañantes empáticos y verificados para actividades cotidianas, 
                ocio o gestiones esenciales. Porque nadie debería sentirse solo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <LinkButton href={routes.solicitud} className="h-14 px-8 text-lg">
                  Empezar ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </LinkButton>
                <LinkButton href={routes.perfil} variant="ghost" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10">
                  Quiero ser acompañante
                </LinkButton>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-400/20 blur-3xl rounded-full" />
              <Card className="relative p-6 border-0 shadow-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
                <img
                  src={sampleCompanion.image}
                  alt={sampleCompanion.alt}
                  className="w-full h-[400px] object-cover rounded-2xl shadow-inner"
                />
                <div className="mt-6 p-4 bg-white rounded-xl shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{sampleCompanion.name}</h3>
                      <p className="text-gray-500 mt-1">{sampleCompanion.bio}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                      <Star className="w-4 h-4 fill-yellow-400 border-none" />
                      4.9
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Verificado</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">Disponible</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Flujo en cinco pasos</h2>
            <p className="text-gray-500 text-lg">
              Inspirado en los mejores estándares de economía colaborativa. Rápido, seguro y centrado en la confianza mutua.
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
        </Container>
      </Section>

      <Section className="bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Para familias y usuarios</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Crea una solicitud sencilla, revisa perfiles verificados y reserva con total garantía de seguridad y seguimiento.
              </p>
              <LinkButton href={routes.solicitud} variant="primary" className="w-full sm:w-auto">
                Quiero acompañamiento
              </LinkButton>
            </Card>
            <Card className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Para acompañantes</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Aporta tu tiempo, gana ingresos extra y recibe formación especializada para ayudar a quienes más lo necesitan.
              </p>
              <LinkButton href={routes.perfil} variant="secondary" className="w-full sm:w-auto">
                Quiero ser acompañante
              </LinkButton>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
