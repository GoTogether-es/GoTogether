import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  const prisma = {
    user: {
      upsert: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@test.com', role: 'CLIENT' }),
    },
  } as unknown as PrismaService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
      if (key === 'RESEND_API_KEY') return 're_test';
      if (key === 'RESEND_FROM') return 'test@test.com';
      if (key === 'NEXT_PUBLIC_APP_URL') return 'http://localhost:3000';
      return null;
    }),
  } as unknown as ConfigService;

  it('constructs the service', () => {
    const service = new AuthService(prisma, mockConfigService);
    expect(service).toBeDefined();
  });

  it('validates and syncs user', async () => {
    const service = new AuthService(prisma, mockConfigService);
    const result = await service.validateAndSyncUser({
      userId: 'user-1',
      email: 'test@demo.es',
    });
    expect(result).toHaveProperty('id', 'user-1');
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      update: { email: 'test@demo.es' },
      create: { id: 'user-1', email: 'test@demo.es' },
    });
  });

  it('logs out', async () => {
    const service = new AuthService(prisma, mockConfigService);
    const result = await service.logout('Bearer test-token');
    expect(result).toEqual({ success: true });
  });
});
