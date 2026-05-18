'use client';

import { useRouter } from 'next/navigation';
import { Card, Container, Section } from '@gotogether/ui';
import { User, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/link-button';

export default function OnboardingPage() {
  const router = useRouter();

  const roles = [
    {
      key: 'client',
      title: 'Busco acompañamiento',
      description: 'Necesito ayuda para tareas, paseos o gestiones cotidianas.',
      icon: User,
      gradient: 'from-blue-500 to-blue-600',
      route: '/perfil?onboarding=true&role=client',
    },
    {
      key: 'companion',
      title: 'Quiero ser acompañante',
      description: 'Quiero ofrecer mi tiempo y habilidades a quienes lo necesitan.',
      icon: UserPlus,
      gradient: 'from-emerald-500 to-emerald-600',
      route: '/perfil?onboarding=true&role=companion',
    },
    {
      key: 'supervisor',
      title: 'Soy un supervisor',
      description: 'Quiero gestionar las reservas de un familiar o persona a mi cargo.',
      icon: ShieldCheck,
      gradient: 'from-violet-500 to-violet-600',
      route: '/perfil?onboarding=true&role=supervisor',
    },
  ];

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-3">
            ¡Bienvenido a GoTogether!
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Elige cómo quieres participar en la comunidad. Siempre podrás cambiar tu rol más adelante.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(role.route)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(role.route);
                    }
                  }}
                  className="cursor-pointer group outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 rounded-[24px]"
                >
                  <Card className="p-8 border-0 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold mb-3">{role.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      {role.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                      Empezar
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <LinkButton href="/auth/login" variant="ghost" className="text-sm px-2 py-1">
              Inicia sesión aquí
            </LinkButton>
          </p>
        </div>
      </Container>
    </Section>
  );
}
