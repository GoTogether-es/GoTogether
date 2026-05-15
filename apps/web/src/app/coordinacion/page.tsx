import { Button, Card, Container, Section } from '@gotogether/ui';
import { MessageSquare, Phone, MapPin, Clock } from 'lucide-react';

const messages = [
  {
    author: 'Familia',
    text: 'Hola Lucía, estará mi madre en la puerta a las 10:20.',
  },
  {
    author: 'Lucía',
    text: 'Perfecto, llego unos minutos antes. Llevo paraguas por si llueve.',
  },
];

export default function CoordinacionPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Coordinación del Servicio</h1>
          <p className="text-gray-500 mb-8">
            Chat seguro en tiempo real y llamadas protegidas para coordinar los detalles.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-6 flex flex-col gap-6 border-0 shadow-xl shadow-gray-900/5">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    L
                  </div>
                  <div>
                    <h3 className="font-bold">Lucía Martínez</h3>
                    <p className="text-xs text-green-600 font-medium">En línea ahora</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-blue-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Llamar
                </Button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 min-h-[300px] flex flex-col gap-4 overflow-y-auto">
                {messages.map((message, i) => (
                  <div key={i} className={`flex flex-col ${message.author === 'Lucía' ? 'items-start' : 'items-end'}`}>
                    <span className="text-xs text-gray-400 mb-1 px-2">{message.author}</span>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      message.author === 'Lucía' 
                        ? 'bg-white text-gray-800 rounded-tl-none' 
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input className="gt-input flex-grow" placeholder="Escribe un mensaje..." />
                <Button variant="primary" className="px-6">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 border-0 shadow-xl shadow-gray-900/5">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Detalles de la actividad
                </h3>
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ubicación</span>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="font-medium">Calle Serrano 12, Madrid</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Hora de encuentro</span>
                    <div className="flex items-start gap-2 mt-1">
                      <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="font-medium">Mañana, 10:20 AM</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-blue-600 text-white border-0 shadow-xl shadow-blue-600/20">
                <h4 className="font-bold mb-2">Asistencia Segura</h4>
                <p className="text-blue-100 text-sm mb-6">
                  Si necesitas ayuda urgente o quieres reportar una incidencia durante el servicio:
                </p>
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0">
                  Llamada de Emergencia
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
