import { Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { AuthLink } from '@/components/auth-link';
import { homeSteps } from '@/lib/content';
import { routes } from '@/lib/routes';
import { CheckCircle2, ArrowRight, ShieldCheck, ShieldAlert, Users, Lock, Headset, CreditCard, FileCheck, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
        <Container className="py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-sm font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" />
              Confianza y Seguridad Certificada
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Acompañamiento humano para vivir con más autonomía
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Conecta con acompañantes empáticos y verificados para actividades cotidianas,
              ocio o gestiones esenciales. Porque nadie debería sentirse solo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LinkButton href={routes.login} className="h-14 px-8 text-lg">
                Empezar ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </LinkButton>
              <LinkButton href={routes.explorar} variant="secondary" className="h-14 px-8 text-lg">
                Explorar acompañantes
              </LinkButton>
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
              <AuthLink className="gt-button gt-button--primary w-full sm:w-auto">
                Quiero acompañamiento
              </AuthLink>
            </Card>
            <Card className="p-10 border-0 shadow-lg hover:translate-y-[-4px] transition-transform">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Para acompañantes</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Aporta tu tiempo, gana ingresos extra y recibe formación especializada para ayudar a quienes más lo necesitan.
              </p>
              <AuthLink className="gt-button gt-button--secondary w-full sm:w-auto">
                Quiero ser acompañante
              </AuthLink>
            </Card>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Tu tranquilidad es nuestra prioridad</h2>
            <p className="text-gray-500 text-lg">Cada detalle está pensado para que confíes plenamente en la plataforma</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldAlert, title: 'Verificación de identidad', desc: 'Todos los acompañantes pasan un riguroso proceso de verificación documental y de antecedentes antes de ofrecer servicios.' },
              { icon: CreditCard, title: 'Pago seguro vía Stripe', desc: 'Los pagos se procesan con Stripe, el estándar mundial en pagos online. Sin compartir datos bancarios entre usuarios.' },
              { icon: Lock, title: 'Datos protegidos (RGPD)', desc: 'Tus datos personales se almacenan cifrados y se tratan conforme al Reglamento General de Protección de Datos europeo.' },
              { icon: Headset, title: 'Soporte dedicado', desc: 'Estamos disponibles para ayudarte con cualquier incidencia antes, durante y después de cada acompañamiento.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6 border-gray-50 hover:shadow-lg transition-shadow text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-blue-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Cómo trabajamos</h2>
            <p className="text-blue-100 text-lg">Compromiso, transparencia y cercanía en cada paso del proceso</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, value: 'Validación', label: 'Identidad y antecedentes verificados de cada acompañante' },
              { icon: MapPin, value: 'Trazabilidad', label: 'Seguimiento en tiempo real de cada servicio activo' },
              { icon: ShieldCheck, value: 'Garantía', label: 'Pago retenido hasta que el servicio se complete satisfactoriamente' },
              { icon: CheckCircle2, value: 'Transparencia', label: 'Valoraciones mutuas públicas después de cada acompañamiento' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={value} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-2xl font-extrabold mb-1">{value}</p>
                <p className="text-blue-100 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
