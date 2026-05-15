import { Button, Card, Container, Section } from '@gotogether/ui';

export default function HappinessReportPage() {
  return (
    <Section>
      <Container>
        <h1>Reporte de felicidad</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          Seguimiento con check-ins y formulario post-servicio para mejorar la experiencia.
        </p>
        <div className="gt-grid gt-grid-2" style={{ marginTop: 32 }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Seguimiento en tiempo real</h3>
            <div className="gt-grid" style={{ gap: 12 }}>
              <div>
                <strong>Check-in</strong>
                <p className="gt-helper">Lucia llego al punto de encuentro.</p>
              </div>
              <div>
                <strong>Ubicacion</strong>
                <p className="gt-helper">Compartida durante la actividad (opcional).</p>
              </div>
              <div>
                <strong>Notificaciones</strong>
                <p className="gt-helper">Avisos automaticos para la familia.</p>
              </div>
            </div>
          </Card>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Resumen y valoracion</h3>
            <div className="gt-grid" style={{ gap: 12 }}>
              <div>
                <label className="gt-label" htmlFor="summary">
                  Resumen textual
                </label>
                <textarea
                  id="summary"
                  className="gt-input"
                  rows={4}
                  placeholder="Hoy hemos visitado el medico y luego tomamos un cafe..."
                />
              </div>
              <div>
                <label className="gt-label" htmlFor="rating">
                  Valoracion (1 a 5)
                </label>
                <select id="rating" className="gt-input">
                  <option>5 - Excelente</option>
                  <option>4 - Muy bien</option>
                  <option>3 - Bien</option>
                  <option>2 - Mejorable</option>
                  <option>1 - Mala experiencia</option>
                </select>
              </div>
              <Button>Enviar reporte</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
