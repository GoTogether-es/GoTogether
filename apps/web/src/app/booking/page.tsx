import { Button, Card, Container, Section } from '@gotogether/ui';

export default function BookingPage() {
  return (
    <Section>
      <Container>
        <h1>Reserva y pago</h1>
        <p className="gt-helper" style={{ maxWidth: 640 }}>
          El pago se congela hasta que el acompanante acepta la solicitud. Luego se libera con
          la comision de GoTogether.
        </p>
        <div className="gt-grid gt-grid-2" style={{ marginTop: 32 }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Resumen de la reserva</h3>
            <div className="gt-grid" style={{ gap: 12 }}>
              <div>
                <strong>Servicio</strong>
                <p className="gt-helper">Acompanamiento al medico</p>
              </div>
              <div>
                <strong>Fecha</strong>
                <p className="gt-helper">Miercoles 12 de Junio, 10:30</p>
              </div>
              <div>
                <strong>Direccion</strong>
                <p className="gt-helper">Calle Serrano 12, Madrid</p>
              </div>
              <div>
                <strong>Total</strong>
                <p className="gt-helper">45 EUR (comision incluida)</p>
              </div>
            </div>
          </Card>
          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Pago seguro</h3>
            <p className="gt-helper">
              Tarjeta, Apple Pay o Google Pay mediante Stripe Connect.
            </p>
            <div className="gt-grid" style={{ gap: 12 }}>
              <input className="gt-input" placeholder="Numero de tarjeta" />
              <div className="gt-grid gt-grid-2">
                <input className="gt-input" placeholder="MM/AA" />
                <input className="gt-input" placeholder="CVC" />
              </div>
              <Button>Confirmar y congelar pago</Button>
              <Button variant="ghost">Volver</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
