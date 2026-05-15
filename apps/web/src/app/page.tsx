import { Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { homeSteps, sampleCompanion } from '@/lib/content';
import { routes } from '@/lib/routes';

export default function HomePage() {
  return (
    <main>
      <section className="gt-hero">
        <Container className="gt-section">
          <div className="gt-grid gt-grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="gt-tag">GoTogether</span>
              <h1 style={{ fontSize: '2.75rem', margin: '16px 0' }}>
                Acompanamiento humano para vivir con mas autonomia
              </h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 520 }}>
                Conecta con acompanantes empaticos y verificados para actividades cotidianas,
                ocio o gestiones esenciales.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <LinkButton href={routes.briefing}>Crear briefing</LinkButton>
                <LinkButton href={routes.profiling} variant="ghost">
                  Quiero ser acompanante
                </LinkButton>
              </div>
            </div>
            <Card className="gt-card" style={{ padding: 24 }}>
              <img
                src={sampleCompanion.image}
                alt={sampleCompanion.alt}
                style={{
                  width: '100%',
                  borderRadius: 20,
                  objectFit: 'cover',
                  height: 320,
                }}
              />
              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: 0 }}>{sampleCompanion.name}</h3>
                <p className="gt-helper" style={{ marginTop: 4 }}>
                  {sampleCompanion.bio}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <span className="gt-tag">{sampleCompanion.rating}</span>
                  <span className="gt-tag">{sampleCompanion.years}</span>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <h2 style={{ marginBottom: 16 }}>Flujo en cinco pasos</h2>
          <p style={{ maxWidth: 640, color: '#4a6278' }}>
            Inspirado en BlaBlaCar, Airbnb y Uber. Rapido, seguro y centrado en la confianza.
          </p>
          <div className="gt-grid gt-grid-3" style={{ marginTop: 32 }}>
            {homeSteps.map((step) => (
              <Card key={step.title} style={{ padding: 24 }}>
                <h3 style={{ marginTop: 0 }}>{step.title}</h3>
                <p className="gt-helper">{step.copy}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="gt-grid gt-grid-2" style={{ alignItems: 'center' }}>
            <Card style={{ padding: 28 }}>
              <h3 style={{ marginTop: 0 }}>Para familias y personas mayores</h3>
              <p className="gt-helper">
                Crea un briefing sencillo, revisa perfiles verificados y reserva con garantia.
              </p>
              <LinkButton href={routes.briefing} variant="secondary">
                Quiero acompanamiento
              </LinkButton>
            </Card>
            <Card style={{ padding: 28 }}>
              <h3 style={{ marginTop: 0 }}>Para acompanantes</h3>
              <p className="gt-helper">
                Aporta tu tiempo, gana ingresos y recibe formacion especializada.
              </p>
              <LinkButton href={routes.profiling} variant="secondary">
                Quiero ser acompanante
              </LinkButton>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
