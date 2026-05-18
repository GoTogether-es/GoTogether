import { Container, Section, Card } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
              <h1 className="text-3xl font-bold">Política de Privacidad</h1>
            </div>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              <p><strong>Última actualización:</strong> Mayo 2026</p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">1. Responsable del Tratamiento</h2>
              <p>
                GoTogether es el responsable del tratamiento de los datos personales recogidos a través de esta plataforma. Puedes contactarnos para cualquier cuestión relacionada con la protección de datos.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">2. Datos que Recopilamos</h2>
              <p>
                Recopilamos los siguientes datos personales:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Correo electrónico (para inicio de sesión mediante enlace mágico)</li>
                <li>Nombre y apellidos</li>
                <li>Número de teléfono (opcional)</li>
                <li>Información de perfil (biografía, preferencias, necesidades específicas)</li>
                <li>Datos de verificación para acompañantes (certificados de antecedentes)</li>
                <li>Historial de reservas y valoraciones</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">3. Finalidad del Tratamiento</h2>
              <p>Utilizamos tus datos para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gestionar tu cuenta y autenticación</li>
                <li>Facilitar la conexión entre usuarios y acompañantes</li>
                <li>Procesar pagos a través de Stripe</li>
                <li>Verificar la identidad de los acompañantes</li>
                <li>Mejorar la seguridad de la plataforma</li>
                <li>Enviar comunicaciones relacionadas con el servicio</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">4. Base Legal</h2>
              <p>
                El tratamiento se basa en la ejecución del contrato de servicios, el consentimiento del interesado para fines específicos, y el interés legítimo en garantizar la seguridad de la plataforma.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">5. Conservación de Datos</h2>
              <p>
                Conservamos tus datos mientras mantengas tu cuenta activa. En caso de solicitar la eliminación, mantendremos los datos mínimos necesarios para cumplir con obligaciones legales durante el plazo legal establecido.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">6. Tus Derechos</h2>
              <p>Como usuario, tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la supresión de tus datos</li>
                <li>Oponerte al tratamiento</li>
                <li>Solicitar la portabilidad de tus datos</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">7. Seguridad</h2>
              <p>
                Implementamos medidas técnicas y organizativas para proteger tus datos. Utilizamos encriptación SSL, autenticación mediante tokens seguros, y almacenamiento cifrado en Cloudflare R2.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">8. Servicios de Terceros</h2>
              <p>
                Utilizamos los siguientes servicios de terceros que pueden procesar datos personales:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Supabase (autenticación y base de datos)</li>
                <li>Stripe (procesamiento de pagos)</li>
                <li>Resend (envío de correos electrónicos)</li>
                <li>Cloudflare R2 (almacenamiento de archivos)</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">9. Cookies</h2>
              <p>
                Utilizamos cookies necesarias para el funcionamiento de la plataforma (sesión, autenticación). No utilizamos cookies de seguimiento ni publicitarias.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">10. Modificaciones</h2>
              <p>
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos a través de la plataforma o por correo electrónico.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
