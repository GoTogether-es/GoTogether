import { ProfilesService } from './profiles.service';
import { UserRole } from '../../generated/client';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockUser, mockProfile, mockCompanionProfile } from '../../test-utils/factories';
import { NotFoundException } from '@nestjs/common';
import { GeocodingService } from '../location/geocoding.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let geocodingService: { geocode: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createMockPrismaService();
    geocodingService = { geocode: jest.fn().mockResolvedValue({ latitude: 36.7213, longitude: -4.4214 }) };
    service = new ProfilesService(prisma as any, geocodingService as unknown as GeocodingService);
  });

  describe('upsertProfile', () => {
    const baseDto = {
      fullName: 'Juan Perez',
      city: 'Málaga',
      fullAddress: 'Calle Larios 1',
      headline: 'Jubilado',
      bio: 'Me gusta pasear',
      phone: '+34 600 000 000',
    };

    it('creates profile and assigns COMPANION role when isCompanion is true', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile({ id: 'profile-1' }));
      prisma.companionProfile.upsert.mockResolvedValue(mockCompanionProfile());
      prisma.user.update.mockResolvedValue(mockUser({ role: UserRole.COMPANION }));
      prisma.user.findUnique.mockResolvedValue(mockUser());
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile() }),
      );
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', {
        ...baseDto,
        isCompanion: true,
        specialties: 'Cocina, enfermeria',
      } as any);

      expect(prisma.companionProfile.upsert).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.COMPANION } }),
      );
    });

    it('assigns SUPERVISOR role when requested role is SUPERVISOR', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile());
      prisma.user.update.mockResolvedValue(mockUser({ role: UserRole.SUPERVISOR }));
      prisma.profile.findUnique.mockResolvedValue(mockProfile());
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', {
        ...baseDto,
        role: 'SUPERVISOR',
      } as any);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.SUPERVISOR } }),
      );
    });

    it('does not downgrade SUPERVISOR to CLIENT on re-upsert', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile());
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.SUPERVISOR }));
      prisma.profile.findUnique.mockResolvedValue(mockProfile());
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', baseDto as any);

      expect(prisma.user.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.CLIENT } }),
      );
    });

    it('does not downgrade ADMIN to CLIENT on re-upsert', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile());
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.ADMIN }));
      prisma.profile.findUnique.mockResolvedValue(mockProfile());
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', baseDto as any);

      expect(prisma.user.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.CLIENT } }),
      );
    });

    it('assigns CLIENT role when user has no special role', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile());
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      prisma.user.update.mockResolvedValue(mockUser());
      prisma.profile.findUnique.mockResolvedValue(mockProfile());
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', baseDto as any);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.CLIENT } }),
      );
    });

    it('calls ensureUser before upserting profile', async () => {
      prisma.profile.upsert.mockResolvedValue(mockProfile());
      prisma.user.findUnique.mockResolvedValue(mockUser());
      prisma.profile.findUnique.mockResolvedValue(mockProfile());
      prisma.userLocation.upsert.mockResolvedValue({});

      await service.upsertProfile('user-1', baseDto as any);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        update: {},
        create: { id: 'user-1', email: 'user-1@placeholder.gotogether' },
      });
    });
  });

  describe('getCompanionById', () => {
    it('returns companion with computed fields', async () => {
      prisma.companionProfile.findUnique.mockResolvedValue({
        ...mockCompanionProfile({ id: 'comp-1' }),
        bookings: [
          { report: { rating: 5 } },
          { report: { rating: 4 } },
        ],
      });

      const result = await service.getCompanionById('comp-1');

      expect(result.completedServices).toBe(2);
      expect(result.averageRating).toBe(4.5);
      expect(result.recentRatings).toEqual([5, 4]);
    });

    it('returns null averageRating when no ratings', async () => {
      prisma.companionProfile.findUnique.mockResolvedValue({
        ...mockCompanionProfile({ id: 'comp-1' }),
        bookings: [],
      });

      const result = await service.getCompanionById('comp-1');

      expect(result.averageRating).toBeNull();
      expect(result.completedServices).toBe(0);
    });

    it('throws NotFoundException when companion not found', async () => {
      prisma.companionProfile.findUnique.mockResolvedValue(null);

      await expect(service.getCompanionById('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns only latest 5 ratings in recentRatings', async () => {
      const bookings = Array.from({ length: 7 }, (_, i) => ({
        report: { rating: i + 1 },
      }));
      prisma.companionProfile.findUnique.mockResolvedValue({
        ...mockCompanionProfile({ id: 'comp-1' }),
        bookings,
      });

      const result = await service.getCompanionById('comp-1');

      expect(result.recentRatings).toEqual([3, 4, 5, 6, 7]);
    });
  });

  describe('listCompanions', () => {
    it('returns only verified companions', async () => {
      prisma.companionProfile.findMany.mockResolvedValue([
        mockCompanionProfile({ verified: true }),
      ]);

      const result = await service.listCompanions();

      expect(result).toHaveLength(1);
      const findManyCall = prisma.companionProfile.findMany.mock.calls[0][0];
      expect(findManyCall.where.verified).toBe(true);
    });
  });
});
