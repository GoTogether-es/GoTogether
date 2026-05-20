import { Card, Container, Section } from '@gotogether/ui';
import { AuthLink } from '@/components/auth-link';
import { Search, FileText, MessageSquare, Star, CheckCircle2, ArrowRight, CalendarDays, UserCheck, ShieldCheck } from 'lucide-react';
import { PrimerosPasosContent } from '@/components/primeros-pasos-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Primeros pasos',
  description: 'Guía rápida para empezar a usar GoTogether. Crea tu perfil, busca acompañante y disfruta.',
};

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

      <PrimerosPasosContent />

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
