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

  it('creates magic link session', async () => {
    const service = new AuthService(prisma);
    await service.requestMagicLink('test@demo.es');
    expect(prisma.user.upsert).toHaveBeenCalled();
    expect(prisma.magicLinkSession.create).toHaveBeenCalled();
  });

  it('rejects invalid token', async () => {
    const service = new AuthService(prisma);
    const result = await service.verifyMagicLink('invalid');
    expect(result.ok).toBe(false);
  });
});
