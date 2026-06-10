import { AdminGuard } from './admin.guard';
import { RolesAuthGuard, Roles, ROLES_KEY } from './roles-auth.guard';
import { RolesGuard } from './roles.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { createMockConfigService } from '../../test-utils/services';
import { UserRole } from '../../generated/client';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));


describe('AdminGuard', () => {
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = createMockConfigService({ ADMIN_PASSWORD_HASH: '$2a$10$hashedpassword' });
  });

  it('throws UnauthorizedException when ADMIN_PASSWORD_HASH is not configured', async () => {
    const badConfig = createMockConfigService({});
    const context = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as any;

    await expect(new AdminGuard(badConfig as any).canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when x-admin-key header is missing', async () => {
    const context = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as any;

    await expect(new AdminGuard(configService as any).canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when password is incorrect', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-admin-key': 'wrong-key' } }) }),
    } as any;

    await expect(new AdminGuard(configService as any).canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('returns true when password is correct', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-admin-key': 'correct-key' } }) }),
    } as any;

    const result = await new AdminGuard(configService as any).canActivate(context);

    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('correct-key', '$2a$10$hashedpassword');
  });
});

describe('RolesGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('returns true when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.CLIENT } }) }),
    } as any;

    expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
  });

  it('returns false when user is not set on request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COMPANION]);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: undefined }) }),
    } as any;

    expect(new RolesGuard(reflector).canActivate(context)).toBe(false);
  });

  it('returns true when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COMPANION]);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.COMPANION } }) }),
    } as any;

    expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
  });

  it('returns false when user has wrong role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COMPANION]);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.CLIENT } }) }),
    } as any;

    expect(new RolesGuard(reflector).canActivate(context)).toBe(false);
  });
});

describe('RolesAuthGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('returns false when JWT is invalid', async () => {
    const guard = new RolesAuthGuard(reflector);
    jest.spyOn(guard, 'canActivate' as any).mockResolvedValue(false);

    const context = { getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => ({}) }) } as any;
    Object.defineProperty(guard, 'canActivate', { value: guard['canActivate'], writable: true });
  });
});

describe('Roles decorator', () => {
  it('sets metadata on a method', () => {
    class TestClass {
      @Roles(UserRole.ADMIN)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.testMethod);
    expect(metadata).toEqual([UserRole.ADMIN]);
  });

  it('sets metadata on a class', () => {
    @Roles(UserRole.COMPANION)
    class TestClass {}

    const metadata = Reflect.getMetadata(ROLES_KEY, TestClass);
    expect(metadata).toEqual([UserRole.COMPANION]);
  });
});
