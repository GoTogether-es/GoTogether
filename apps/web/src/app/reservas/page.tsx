import { Button, Card, Container, Section } from '@gotogether/ui';
import { ShieldCheck, CreditCard, Calendar, MapPin, Briefcase } from 'lucide-react';

export default function ReservasPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Reserva y Pago Seguro</h1>
          <p className="text-gray-500 mb-10">
            El importe se mantiene retenido de forma segura hasta que el acompañante confirme la solicitud.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 border-b pb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Resumen de la reserva
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</span>
                    <p className="font-semibold text-gray-800 text-lg">Acompañamiento al médico</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha y Hora</span>
                    <p className="font-semibold text-gray-800">Miércoles, 12 de Junio - 10:30 AM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dirección</span>
                    <p className="font-semibold text-gray-800">Calle Serrano 12, Madrid</p>
                  </div>
                </div>

                <div className="pt-6 border-t mt-6 flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-black text-blue-600">45,00€</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5 bg-gray-50">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-900">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Método de pago
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                Pago procesado mediante pasarela segura de Stripe.
              </p>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Número de tarjeta</label>
                  <input className="gt-input bg-white" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Caducidad</label>
                    <input className="gt-input bg-white" placeholder="MM/AA" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">CVC</label>
                    <input className="gt-input bg-white" placeholder="123" />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <Button variant="primary" className="w-full h-14 text-lg">
                    Confirmar Reserva
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    Pago seguro con encriptación SSL
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
