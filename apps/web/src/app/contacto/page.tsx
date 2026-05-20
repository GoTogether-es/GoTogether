import { Card, Container, Section } from '@gotogether/ui';
import { Mail, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contactar',
  description: 'Contacta con GoTogether. Escríbenos a info@gotogether.es o llámanos al 643 415 190. Resolvemos tus dudas.',
  openGraph: { title: 'Contactar - GoTogether' },
};

export default function ContactoPage() {
  return (
    <main>
      <Section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Contactar
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Estaremos encantados de resolver tus dudas. Escríbenos y te responderemos lo antes posible.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Card className="p-10 border-0 shadow-xl shadow-blue-900/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Correo electrónico</h3>
                      <p className="text-gray-500 text-sm">Respuesta en menos de 24h</p>
                    </div>
                  </div>
                  <a
                    href="mailto:info@gotogether.es"
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-lg"
                  >
                    info@gotogether.es
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Teléfono</h3>
                      <p className="text-gray-500 text-sm">Llámanos o envíanos un WhatsApp</p>
                    </div>
                  </div>
                  <a
                    href="tel:643415190"
                    className="text-blue-600 font-medium hover:underline text-lg"
                  >
                    643 415 190
                  </a>
                </div>
              </div>

              <hr className="my-8 border-gray-100" />

              <p className="text-gray-500 leading-relaxed">
                Si tienes preguntas sobre cómo funciona GoTogether, visita nuestra página de{' '}
                <a href="/info" className="text-blue-600 hover:underline font-medium">Cómo funciona</a>.
                Para consultas sobre privacidad o términos legales, consulta nuestra{' '}
                <a href="/legal/privacy" className="text-blue-600 hover:underline font-medium">Política de Privacidad</a>.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
