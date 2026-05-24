import { SupabaseJwtStrategy } from './supabase.strategy';
import { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../prisma/prisma.service';

jest.mock('jwks-rsa', () => {
  return jest.fn().mockImplementation(() => ({
    getSigningKey: jest.fn((_kid, cb) => {
      cb(null, { getPublicKey: () => 'public-key-123' });
    }),
  }));
});

describe('SupabaseJwtStrategy', () => {
  let strategy: SupabaseJwtStrategy;

  it('constructs with valid config', () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') return 'https://test.supabase.co';
        return null;
      }),
    } as unknown as ConfigService;

    const prisma = {} as PrismaService;

    strategy = new SupabaseJwtStrategy(configService, prisma);
    expect(strategy).toBeDefined();
  });

  it('throws when supabase URL is missing', () => {
    const configService = {
      get: jest.fn().mockReturnValue(null),
    } as unknown as ConfigService;

    const prisma = {} as PrismaService;

    expect(() => new SupabaseJwtStrategy(configService, prisma)).toThrow(
      'NEXT_PUBLIC_SUPABASE_URL is not defined',
    );
  });

  it('validate returns user data from DB', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') return 'https://test.supabase.co';
        return null;
      }),
    } as unknown as ConfigService;

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'CLIENT' }),
      },
    } as unknown as PrismaService;

    strategy = new SupabaseJwtStrategy(configService, prisma);

    const result = await strategy.validate({ sub: 'user-1', email: 'test@test.com' });

    expect(result).toEqual({ userId: 'user-1', email: 'test@test.com', role: 'CLIENT' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { role: true },
    });
  });

  it('validate returns null role when user not in DB', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') return 'https://test.supabase.co';
        return null;
      }),
    } as unknown as ConfigService;

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    strategy = new SupabaseJwtStrategy(configService, prisma);

    const result = await strategy.validate({ sub: 'new-user', email: 'new@test.com' });

    expect(result).toEqual({ userId: 'new-user', email: 'new@test.com', role: null });
  });
});
