import { AuthService } from './auth.service';
import type { ConfigService } from '@nestjs/config';
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
  } as unknown as ConfigService;

  it('constructs the service', async () => {
    const service = new AuthService(prisma, mockConfigService);
    expect(service).toBeDefined();
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
