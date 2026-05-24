import { UsersService } from './users.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockUser } from '../../test-utils/factories';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new UsersService(prisma as any);
  });

  it('lists all users when no search is provided', async () => {
    prisma.user.findMany.mockResolvedValue([mockUser()]);
    const result = await service.list();
    expect(result).toHaveLength(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith({ where: {}, include: { profile: true } });
  });

  it('searches by email', async () => {
    prisma.user.findMany.mockResolvedValue([mockUser({ email: 'test@test.com' })]);
    await service.list('test');
    const call = prisma.user.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR[0].email.contains).toBe('test');
  });

  it('returns empty array when no users match', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    const result = await service.list('nonexistent');
    expect(result).toEqual([]);
  });
});
