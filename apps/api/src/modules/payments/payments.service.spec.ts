import { PaymentsService } from './payments.service';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'requires_capture' }),
      capture: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' }),
      cancel: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'canceled' }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded' }),
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    service = new PaymentsService();
  });

  it('creates a payment hold', async () => {
    const result = await service.createHold(1500, 'eur');
    expect(result).toHaveProperty('id', 'pi_123');
    expect(result).toHaveProperty('status', 'requires_capture');
  });

  it('captures a payment', async () => {
    const result = await service.capturePayment('pi_123');
    expect(result).toHaveProperty('status', 'succeeded');
  });

  it('releases a payment', async () => {
    const result = await service.releasePayment('pi_123');
    expect(result).toHaveProperty('status', 'canceled');
  });

  it('constructs a webhook event', () => {
    const payload = Buffer.from('test');
    const event = service.constructWebhookEvent(payload, 'sig_test');
    expect(event).toHaveProperty('type', 'payment_intent.succeeded');
  });

  it('throws when STRIPE_WEBHOOK_SECRET is not set', () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const svc = new PaymentsService();
    expect(() => svc.constructWebhookEvent(Buffer.from('test'), 'sig')).toThrow(
      'STRIPE_WEBHOOK_SECRET no configurado',
    );
  });
});
