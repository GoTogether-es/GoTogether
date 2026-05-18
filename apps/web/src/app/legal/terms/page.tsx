import { Container, Section, Card } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <LinkButton href="/" variant="ghost" className="mb-8 text-sm">
            &larr; Volver al inicio
          </LinkButton>

          <Card className="p-10 border-0 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h1 className="text-3xl font-bold">Términos de Servicio</h1>
            </div>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              <p><strong>Última actualización:</strong> Mayo 2026</p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar GoTogether, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">2. Descripción del Servicio</h2>
              <p>
                GoTogether es una plataforma digital que conecta a personas mayores y personas con discapacidad con acompañantes verificados para actividades cotidianas. Actuamos como intermediarios tecnológicos, no como empleadores de los acompañantes.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">3. Registro y Verificación</h2>
              <p>
                Para utilizar GoTogether como acompañante, debes completar el proceso de verificación que incluye la presentación de documentación válida. Nos reservamos el derecho de rechazar o desactivar cualquier perfil que no cumpla con nuestros estándares de seguridad.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">4. Pagos y Tarifas</h2>
              <p>
                Los pagos se procesan a través de Stripe. GoTogether retiene el pago hasta que el acompañante acepta la solicitud. Las tarifas de plataforma se descuentan automáticamente del pago al acompañante.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">5. Responsabilidades</h2>
              <p>
                Los acompañantes son responsables de prestar el servicio acordado con profesionalidad y respeto. GoTogether no se hace responsable de incidencias durante el servicio, aunque facilitará la mediación en caso de conflicto.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">6. Cancelaciones</h2>
              <p>
                Las reservas pueden cancelarse antes de ser aceptadas por el acompañante sin coste. Una vez aceptadas, aplican las condiciones de cancelación acordadas en cada caso.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">7. Privacidad</h2>
              <p>
                El tratamiento de tus datos personales se rige por nuestra <a href="/legal/privacy" className="text-blue-600 underline">Política de Privacidad</a>. No compartimos datos personales con terceros sin tu consentimiento explícito.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">8. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">9. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos términos, puedes contactarnos a través de los canales habilitados en la plataforma.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
