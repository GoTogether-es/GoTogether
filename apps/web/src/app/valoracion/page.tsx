import { Button, Card, Container, Section } from '@gotogether/ui';
import { Star, MessageCircle, Info } from 'lucide-react';

export default function ValoracionPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Valoración del Servicio</h1>
          <p className="text-gray-500 mb-10">
            Tu opinión nos ayuda a mantener la seguridad y calidad de la comunidad GoTogether.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Resumen de actividad
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-800 font-medium italic">
                    "Lucía llegó puntual al punto de encuentro y el servicio finalizó correctamente."
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Estado</span>
                    <p className="font-semibold text-green-600">Completado</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Acompañante</span>
                    <p className="font-semibold text-gray-800">Lucía Martínez</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <Star className="w-5 h-5 text-blue-600" />
                Tu feedback
              </h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="summary">
                    ¿Cómo ha ido todo?
                  </label>
                  <textarea
                    id="summary"
                    className="gt-input"
                    rows={4}
                    placeholder="Ej: Todo perfecto, muy amable y atenta..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="rating">
                    Valoración general
                  </label>
                  <select id="rating" className="gt-input bg-white">
                    <option>5 - Excelente</option>
                    <option>4 - Muy bien</option>
                    <option>3 - Bien</option>
                    <option>2 - Regular</option>
                    <option>1 - Mala experiencia</option>
                  </select>
                </div>
                <Button variant="primary" className="w-full h-12 flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Enviar valoración
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
