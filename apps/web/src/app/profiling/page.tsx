import { Button, Card, Container, Section } from '@gotogether/ui';

export default function ProfilingPage() {
  return (
    <Section>
      <Container>
        <h1>Perfilado</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          Completa el perfil con foto, biografia, telefono y preferencias de acompanante.
        </p>
        <div className="gt-grid gt-grid-2" style={{ marginTop: 32 }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Perfil principal</h3>
            <div className="gt-grid" style={{ gap: 16 }}>
              <div>
                <label className="gt-label" htmlFor="photo">
                  Foto de perfil
                </label>
                <input id="photo" type="file" className="gt-input" />
              </div>
              <div>
                <label className="gt-label" htmlFor="bio">
                  Biografia en primera persona
                </label>
                <textarea
                  id="bio"
                  className="gt-input"
                  rows={4}
                  placeholder="Me encanta pasear por parques y conversar..."
                />
              </div>
              <div>
                <label className="gt-label" htmlFor="phone">
                  Telefono de contacto
                </label>
                <input id="phone" className="gt-input" placeholder="+34 600 000 000" />
              </div>
              <div>
                <label className="gt-label" htmlFor="preferences">
                  Preferencias de acompanante
                </label>
                <input
                  id="preferences"
                  className="gt-input"
                  placeholder="Experiencia en movilidad, conduccion"
                />
              </div>
            </div>
          </Card>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Verificacion</h3>
            <p className="gt-helper">
              Sube certificados de antecedentes para completar el proceso de acompanante.
            </p>
            <div className="gt-grid" style={{ gap: 16 }}>
              <div>
                <label className="gt-label" htmlFor="criminal">
                  Antecedentes penales
                </label>
                <input id="criminal" type="file" className="gt-input" />
              </div>
              <div>
                <label className="gt-label" htmlFor="sexual">
                  Delitos sexuales
                </label>
                <input id="sexual" type="file" className="gt-input" />
              </div>
              <div>
                <label className="gt-label" htmlFor="availability">
                  Disponibilidad
                </label>
                <input id="availability" className="gt-input" placeholder="L-V 9:00 - 18:00" />
              </div>
              <Button>Guardar perfil</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
