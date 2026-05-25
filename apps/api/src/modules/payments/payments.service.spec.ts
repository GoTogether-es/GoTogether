import { PaymentsService } from './payments.service';
import { createMockConfigService } from '../../test-utils/services';

jest.mock('stripe', () => {
  const mockStripe = jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'requires_capture' }),
      capture: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' }),
      cancel: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'canceled' }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded' }),
    },
  }));
  return { __esModule: true, default: mockStripe };
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = createMockConfigService({
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    });
    service = new PaymentsService(configService as any);
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
    configService = createMockConfigService({ STRIPE_WEBHOOK_SECRET: '' });
    const svc = new PaymentsService(configService as any);
    expect(() => svc.constructWebhookEvent(Buffer.from('test'), 'sig')).toThrow(
      'STRIPE_WEBHOOK_SECRET no configurado',
    );
  });
});
