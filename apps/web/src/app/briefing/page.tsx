import { Button, Card, Container, Section } from '@gotogether/ui';

export default function BriefingPage() {
  return (
    <Section>
      <Container>
        <h1>Briefing inicial</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          Cuentanos el tipo de servicio, perfil de la persona acompanada y los detalles del
          encuentro.
        </p>
        <Card style={{ marginTop: 32, padding: 24 }}>
          <form className="gt-grid" style={{ gap: 16 }}>
            <div className="gt-grid gt-grid-2">
              <div>
                <label className="gt-label" htmlFor="serviceType">
                  Tipo de servicio
                </label>
                <input
                  id="serviceType"
                  className="gt-input"
                  placeholder="Acompanamiento medico, ocio, gestiones"
                />
              </div>
              <div>
                <label className="gt-label" htmlFor="shortPhrase">
                  Frase que le define
                </label>
                <input id="shortPhrase" className="gt-input" placeholder="Amable y curiosa" />
              </div>
            </div>
            <div className="gt-grid gt-grid-2">
              <div>
                <label className="gt-label" htmlFor="date">
                  Fecha
                </label>
                <input id="date" className="gt-input" type="date" />
              </div>
              <div>
                <label className="gt-label" htmlFor="time">
                  Hora
                </label>
                <input id="time" className="gt-input" type="time" />
              </div>
            </div>
            <div>
              <label className="gt-label" htmlFor="address">
                Direccion
              </label>
              <input
                id="address"
                className="gt-input"
                placeholder="Calle Serrano 12, Madrid"
              />
            </div>
            <div>
              <label className="gt-label" htmlFor="disability">
                Tipo de discapacidad
              </label>
              <select id="disability" className="gt-input">
                <option>Movilidad reducida</option>
                <option>Discapacidad visual</option>
                <option>Discapacidad auditiva</option>
                <option>Discapacidad cognitiva</option>
                <option>Otra</option>
              </select>
            </div>
            <div>
              <label className="gt-label" htmlFor="notes">
                Observaciones adicionales
              </label>
              <textarea
                id="notes"
                className="gt-input"
                rows={4}
                placeholder="Necesita apoyo para subir escaleras"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button>Guardar briefing</Button>
              <Button variant="ghost">Volver</Button>
            </div>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
