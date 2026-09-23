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

  it('filters by search term ignoring accents', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([
      mockCompanionProfile({
        profile: { ...mockCompanionProfile().profile, fullName: 'José Ramírez' },
      }),
      mockCompanionProfile({
        id: 'companion-2',
        profileId: 'profile-2',
        profile: { ...mockCompanionProfile().profile, fullName: 'Ana García', userId: 'user-2' },
      }),
    ]);

    const result = await service.recommendCompanions({ search: 'jose' });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].profile.fullName).toBe('José Ramírez');
    expect(result.meta.total).toBe(1);
  });

  it('includes availability slots in the query', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({});

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.include.availabilitySlots).toBeDefined();
    expect(call.include.availabilitySlots.orderBy).toEqual([
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ]);
  });

  it('filters by disabilityType', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([]);
    prisma.companionProfile.count.mockResolvedValue(0);

    await service.recommendCompanions({ disabilityType: 'Movilidad reducida' });

    const call = prisma.companionProfile.findMany.mock.calls[0][0];
    expect(call.where.profile.disabilityType).toEqual({ equals: 'Movilidad reducida', mode: 'insensitive' });
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
    expect(call.skip).toBeUndefined();
    expect(call.take).toBeUndefined();
  });

  it('returns correct meta.totalPages', async () => {
    prisma.companionProfile.findMany.mockResolvedValue(Array.from({ length: 25 }, () => mockCompanionProfile()));

    const result = await service.recommendCompanions({ page: 1, limit: 9 });

    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
  });

  it('prioritizes companions from the same city', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([
      mockCompanionProfile({
        rating: 4,
        yearsOnPlatform: 1,
        profile: { ...mockCompanionProfile().profile, city: 'Madrid', user: { privateLocation: { latitude: 40.4, longitude: -3.7 } } },
      }),
      mockCompanionProfile({
        rating: 5,
        yearsOnPlatform: 10,
        profile: { ...mockCompanionProfile().profile, city: 'Sevilla', user: { privateLocation: { latitude: 37.4, longitude: -5.98 } } },
      }),
    ]);

    const result = await service.recommendCompanions({ city: 'Madrid', latitude: 40.4168, longitude: -3.7038 });

    expect(result.data[0].profile.city).toBe('Madrid');
  });

  it('city filter ignores accents ("Malaga" finds "Málaga")', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([
      mockCompanionProfile({
        profile: { ...mockCompanionProfile().profile, city: 'Málaga' },
      }),
      mockCompanionProfile({
        id: 'companion-2',
        profileId: 'profile-2',
        profile: { ...mockCompanionProfile().profile, city: 'Sevilla', userId: 'user-2' },
      }),
    ]);

    const result = await service.recommendCompanions({ city: 'Malaga' });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].profile.city).toBe('Málaga');
    expect(result.meta.total).toBe(1);
  });

  it('uses distance and rating in the compound score', async () => {
    prisma.companionProfile.findMany.mockResolvedValue([
      mockCompanionProfile({
        rating: 3.5,
        yearsOnPlatform: 2,
        verified: false,
        profile: { ...mockCompanionProfile().profile, city: 'Madrid', user: { privateLocation: { latitude: 40.4168, longitude: -3.7038 } } },
      }),
      mockCompanionProfile({
        rating: 5,
        yearsOnPlatform: 2,
        verified: true,
        profile: { ...mockCompanionProfile().profile, city: 'Madrid', user: { privateLocation: { latitude: 41.3874, longitude: 2.1686 } } },
      }),
    ]);
    prisma.companionProfile.count.mockResolvedValue(2);

    const result = await service.recommendCompanions({ latitude: 40.4168, longitude: -3.7038 });

    expect(result.data[0].rating).toBe(3.5);
  });
});
