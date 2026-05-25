import { MatchingService } from './matching.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockCompanionProfile } from '../../test-utils/factories';

describe('MatchingService', () => {
  let service: MatchingService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new MatchingService(prisma as any);
  });

  it('returns paginated companions', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([mockCompanionProfile()]);
    prisma.companionProfile.count.mockResolvedValue(1);

    const result = await service.recommendCompanions({ page: 1, limit: 9 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('filters by search term', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({ search: 'María' });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.where.profile.AND[0].OR).toBeDefined();
  });

  it('filters by disabilityType', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({ disabilityType: 'Movilidad reducida' });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.where.profile.AND).toBeDefined();
  });

  it('filters by minRating', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({ minRating: 4 });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.where.rating).toEqual({ gte: 4 });
  });

  it('filters by verified status', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({ verified: true });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.where.verified).toBe(true);
  });

  it('applies pagination correctly', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(20);

    await service.recommendCompanions({ page: 3, limit: 5 });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.skip).toBe(10);
    expect(call.take).toBe(5);
  });

  it('returns correct meta.totalPages', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(25);

    const result = await service.recommendCompanions({ page: 1, limit: 9 });

    expect(result.meta.totalPages).toBe(3);
  });
});
