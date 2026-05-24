import { AvailabilityService } from './availability.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockProfile, mockCompanionProfile } from '../../test-utils/factories';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new AvailabilityService(prisma as any);
  });

  describe('getForCompanion', () => {
    it('returns slots ordered by day and time', async () => {
      prisma.availabilitySlot.findMany.mockResolvedValue([]);
      const result = await service.getForCompanion('comp-1');
      expect(result).toEqual([]);
      const call = prisma.availabilitySlot.findMany.mock.calls[0][0];
      expect(call.where.companionId).toBe('comp-1');
      expect(call.orderBy).toEqual([{ dayOfWeek: 'asc' }, { startTime: 'asc' }]);
    });
  });

  describe('setForCompanion', () => {
    it('throws ForbiddenException when user is not a companion', async () => {
      prisma.profile.findUnique.mockResolvedValue(mockProfile({ companion: null }));

      await expect(service.setForCompanion('user-1', [])).rejects.toThrow(ForbiddenException);
    });

    it('deletes existing slots and creates new ones', async () => {
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile({ id: 'comp-1' }) }),
      );
      prisma.availabilitySlot.deleteMany.mockResolvedValue({ count: 2 });
      prisma.availabilitySlot.createMany.mockResolvedValue({ count: 3 });
      prisma.availabilitySlot.findMany.mockResolvedValue([]);

      const slots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      ];

      await service.setForCompanion('user-1', slots as any);

      expect(prisma.availabilitySlot.deleteMany).toHaveBeenCalledWith({ where: { companionId: 'comp-1' } });
      expect(prisma.availabilitySlot.createMany).toHaveBeenCalled();
    });

    it('handles empty slots array', async () => {
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile({ id: 'comp-1' }) }),
      );
      prisma.availabilitySlot.deleteMany.mockResolvedValue({ count: 1 });
      prisma.availabilitySlot.findMany.mockResolvedValue([]);

      await service.setForCompanion('user-1', []);

      expect(prisma.availabilitySlot.deleteMany).toHaveBeenCalled();
      expect(prisma.availabilitySlot.createMany).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when endTime is before or equal to startTime', async () => {
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile({ id: 'comp-1' }) }),
      );

      const slots = [{ dayOfWeek: 1, startTime: '18:00', endTime: '09:00' }];

      await expect(service.setForCompanion('user-1', slots as any)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when slots overlap on the same day', async () => {
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile({ id: 'comp-1' }) }),
      );

      const slots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 1, startTime: '11:00', endTime: '14:00' },
      ];

      await expect(service.setForCompanion('user-1', slots as any)).rejects.toThrow(BadRequestException);
    });

    it('allows non-overlapping slots on the same day', async () => {
      prisma.profile.findUnique.mockResolvedValue(
        mockProfile({ companion: mockCompanionProfile({ id: 'comp-1' }) }),
      );
      prisma.availabilitySlot.deleteMany.mockResolvedValue({ count: 0 });
      prisma.availabilitySlot.createMany.mockResolvedValue({ count: 2 });
      prisma.availabilitySlot.findMany.mockResolvedValue([]);

      const slots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' },
      ];

      await expect(service.setForCompanion('user-1', slots as any)).resolves.toBeDefined();
    });
  });

  describe('isCompanionAvailable', () => {
    it('returns true when slot exists', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue({ id: 'slot-1' });

      const result = await service.isCompanionAvailable('comp-1', new Date('2026-06-15T10:30:00'));

      expect(result).toBe(true);
    });

    it('returns false when no slot matches', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue(null);

      const result = await service.isCompanionAvailable('comp-1', new Date('2026-06-15T03:00:00'));

      expect(result).toBe(false);
    });

    it('builds correct query for day and time', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue(null);
      const date = new Date('2026-06-15T14:30:00');

      await service.isCompanionAvailable('comp-1', date);

      const call = prisma.availabilitySlot.findFirst.mock.calls[0][0];
      expect(call.where.companionId).toBe('comp-1');
      expect(call.where.dayOfWeek).toBe(date.getDay());
      expect(call.where.startTime.lte).toBe('14:30');
      expect(call.where.endTime.gte).toBe('14:30');
    });

    it('uses localDayOfWeek and localTime when provided (timezone fix)', async () => {
      prisma.availabilitySlot.findFirst.mockResolvedValue({ id: 'slot-1' });

      await service.isCompanionAvailable('comp-1', new Date('2026-06-15T10:30:00Z'), 1, '12:30');

      const call = prisma.availabilitySlot.findFirst.mock.calls[0][0];
      expect(call.where.dayOfWeek).toBe(1);
      expect(call.where.startTime.lte).toBe('12:30');
      expect(call.where.endTime.gte).toBe('12:30');
    });
  });
});
