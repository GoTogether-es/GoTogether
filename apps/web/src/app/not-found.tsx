import { Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { Compass, ArrowLeft, Search } from 'lucide-react';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <Section className="min-h-[70vh] flex items-center justify-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-3xl mb-8">
            <Compass className="w-12 h-12 text-blue-600 motion-safe:animate-pulse" aria-hidden="true" />
            <span className="absolute -top-2 -right-2 flex h-6 w-6">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-600 text-[10px] font-bold text-white items-center justify-center">
                404
              </span>
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Parece que te has perdido en el camino
          </h1>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            La página que buscas no existe o ha sido movida. 
            No te preocupes, en GoTogether siempre hay alguien dispuesto a acompañarte de vuelta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" role="group">
            <LinkButton href="/" variant="primary" className="h-12 px-8 flex items-center gap-2 shadow-lg shadow-blue-600/20 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver al inicio
            </LinkButton>
            <LinkButton href={routes.explorar} variant="ghost" className="h-12 px-8 flex items-center gap-2 w-full sm:w-auto text-blue-600">
              <Search className="w-4 h-4" aria-hidden="true" />
              Explorar acompañantes
            </LinkButton>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-400 font-medium italic">
              &quot;El camino es más fácil cuando no lo recorres solo.&quot;
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
