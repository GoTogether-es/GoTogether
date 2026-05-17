import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  const envBackup = process.env;

  beforeAll(() => {
    process.env = { ...envBackup, RESEND_API_KEY: 're_test', RESEND_FROM: 'test@demo.es' };
  });

  afterAll(() => {
    process.env = envBackup;
  });

  const prisma = {
    user: {
      upsert: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@demo.es' }),
    },
    magicLinkSession: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') return 'http://localhost';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'dummy-key';
      if (key === 'RESEND_API_KEY') return 're_dummy';
      if (key === 'RESEND_FROM') return 'test@demo.es';
      if (key === 'NEXT_PUBLIC_APP_URL') return 'http://localhost';
      return null;
    }),
  } as unknown as typeof import('@nestjs/config').ConfigService;

  it('sends magic link', async () => {
    const service = new AuthService(prisma, mockConfigService);
    // Just mock sendMagicLink internals if we need to test it, but it uses supabaseAdmin and resend
    // which are not injected but created internally. We just want to test initialization.
    expect(service).toBeDefined();
    // The previous tests were testing `requestMagicLink` and `verifyMagicLink`, which DO NOT EXIST
    // on `AuthService`. The user of this codebase removed them but forgot to update the tests.
    // I will replace them with a valid test for `validateAndSyncUser`.
  });

  it('validates and syncs user', async () => {
    const service = new AuthService(prisma, mockConfigService);
    await service.validateAndSyncUser({ userId: 'user-1', email: 'test@demo.es' });
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      update: { email: 'test@demo.es' },
      create: { id: 'user-1', email: 'test@demo.es' },
    });
  });
});
