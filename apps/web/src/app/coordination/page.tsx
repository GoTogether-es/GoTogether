import { Button, Card, Container, Section } from '@gotogether/ui';

const messages = [
  {
    author: 'Familia',
    text: 'Hola Lucia, estara mi madre en la puerta a las 10:20.',
  },
  {
    author: 'Lucia',
    text: 'Perfecto, llego unos minutos antes. Llevo paraguas por si llueve.',
  },
];

export default function CoordinationPage() {
  return (
    <Section>
      <Container>
        <h1>Coordinacion</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          Chat seguro en tiempo real y llamadas protegidas dentro de la app.
        </p>
        <div className="gt-grid gt-grid-2" style={{ marginTop: 32 }}>
          <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Chat con Lucia</strong>
              <Button variant="ghost">Llamar</Button>
            </div>
            <div
              style={{
                background: '#f4f6f8',
                borderRadius: 16,
                padding: 16,
                minHeight: 220,
                display: 'grid',
                gap: 12,
              }}
            >
              {messages.map((message) => (
                <div key={message.text} style={{ display: 'grid', gap: 4 }}>
                  <span className="gt-helper">{message.author}</span>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input className="gt-input" placeholder="Escribe un mensaje" />
              <Button>Enviar</Button>
            </div>
          </Card>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Detalles de la actividad</h3>
            <div className="gt-grid" style={{ gap: 12 }}>
              <div>
                <strong>Ubicacion</strong>
                <p className="gt-helper">Calle Serrano 12, Madrid</p>
              </div>
              <div>
                <strong>Hora de recogida</strong>
                <p className="gt-helper">10:20</p>
              </div>
              <div>
                <strong>Contacto rapido</strong>
                <Button variant="secondary">Llamada protegida</Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
