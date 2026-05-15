import { Button, Card, Container, Section } from '@gotogether/ui';

export default function SolicitudPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Cuéntanos qué necesitas</h1>
          <p className="text-gray-500 mb-8">
            Dinos qué tipo de servicio buscas y los detalles para que podamos encontrar al acompañante ideal.
          </p>
          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="serviceType">
                    ¿Qué tipo de acompañamiento buscas?
                  </label>
                  <input
                    id="serviceType"
                    className="gt-input"
                    placeholder="Ej: Médico, ocio, gestiones..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="shortPhrase">
                    ¿Cómo definirías a la persona acompañada?
                  </label>
                  <input id="shortPhrase" className="gt-input" placeholder="Ej: Amable, habladora, tranquila..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="date">
                    Fecha prevista
                  </label>
                  <input id="date" className="gt-input" type="date" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="time">
                    Hora de inicio
                  </label>
                  <input id="time" className="gt-input" type="time" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="address">
                  Dirección o punto de encuentro
                </label>
                <input
                  id="address"
                  className="gt-input"
                  placeholder="Ej: Calle Mayor 1, Madrid"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disability">
                  Necesidades específicas / Discapacidad
                </label>
                <select id="disability" className="gt-input">
                  <option>Movilidad reducida</option>
                  <option>Discapacidad visual</option>
                  <option>Discapacidad auditiva</option>
                  <option>Discapacidad cognitiva</option>
                  <option>Ninguna / Otra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="notes">
                  Observaciones adicionales
                </label>
                <textarea
                  id="notes"
                  className="gt-input"
                  rows={4}
                  placeholder="Ej: Necesita apoyo para subir escaleras, le gusta hablar de historia..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="primary" className="h-12 px-8">Publicar solicitud</Button>
                <Button variant="ghost" className="h-12 px-8">Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
