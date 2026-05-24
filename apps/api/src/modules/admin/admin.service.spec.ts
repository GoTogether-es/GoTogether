import { AdminService } from './admin.service';
import { BookingStatus } from '../../generated/client';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { createMockConfigService, createMockMailService } from '../../test-utils/services';
import { mockUser, mockProfile, mockCompanionProfile, mockBooking, mockReport, mockService } from '../../test-utils/factories';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let mailService: ReturnType<typeof createMockMailService>;
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createMockPrismaService();
    mailService = createMockMailService();
    configService = createMockConfigService();
    service = new AdminService(prisma as any, mailService as any, configService as any);
  });

  describe('getStats', () => {
    it('returns platform statistics', async () => {
      prisma.user.count.mockResolvedValue(100);
      prisma.profile.count
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(50);
      prisma.companionProfile.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5);
      prisma.booking.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(150);
      prisma.payment.count.mockResolvedValue(120);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });

      const result = await service.getStats();

      expect(result.users).toBe(100);
      expect(result.profiles).toBe(80);
      expect(result.companions).toBe(20);
      expect(result.pendingCompanions).toBe(5);
      expect(result.totalBookings).toBe(200);
      expect(result.activeBookings).toBe(30);
      expect(result.completedBookings).toBe(150);
      expect(result.totalPayments).toBe(120);
      expect(result.totalRevenue).toBe(50000);
    });

    it('handles null revenue sum', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.profile.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.companionProfile.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.booking.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.payment.count.mockResolvedValue(0);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await service.getStats();

      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('listPending', () => {
    it('returns pending companions and clients with disability documents', async () => {
      prisma.companionProfile.findMany.mockResolvedValue([mockCompanionProfile({ verified: false })]);
      prisma.profile.findMany.mockResolvedValue([
        mockProfile({ verified: false, disabilityDocument: 'doc.pdf' }),
      ]);

      const result = await service.listPending();

      expect(result.companions).toHaveLength(1);
      expect(result.clients).toHaveLength(1);
    });

    it('returns empty arrays when nothing is pending', async () => {
      prisma.companionProfile.findMany.mockResolvedValue([]);
      prisma.profile.findMany.mockResolvedValue([]);

      const result = await service.listPending();

      expect(result.companions).toEqual([]);
      expect(result.clients).toEqual([]);
    });
  });

  describe('verifyCompanion', () => {
    it('verifies a companion and sends approval email', async () => {
      const companion = mockCompanionProfile({
        id: 'comp-1',
        profile: {
          ...mockProfile(),
          fullName: 'María',
          user: mockUser({ email: 'maria@test.com' }),
        },
      });
      prisma.companionProfile.findUnique.mockResolvedValue(companion);
      prisma.companionProfile.update.mockResolvedValue({ ...companion, verified: true });

      const result = await service.verifyCompanion('comp-1');

      expect(result.verified).toBe(true);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        'maria@test.com',
        expect.stringContaining('aprobada'),
        expect.any(String),
      );
    });

    it('throws NotFoundException for non-existent companion', async () => {
      prisma.companionProfile.findUnique.mockResolvedValue(null);

      await expect(service.verifyCompanion('comp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectCompanion', () => {
    it('rejects a companion and sends rejection email', async () => {
      const companion = mockCompanionProfile({
        id: 'comp-1',
        profile: {
          ...mockProfile(),
          fullName: 'María',
          user: mockUser({ email: 'maria@test.com' }),
        },
      });
      prisma.companionProfile.findUnique.mockResolvedValue(companion);
      prisma.companionProfile.update.mockResolvedValue({ ...companion, verified: false });

      await service.rejectCompanion('comp-1');

      expect(mailService.sendEmail).toHaveBeenCalledWith(
        'maria@test.com',
        expect.stringContaining('rechazada'),
        expect.any(String),
      );
    });
  });

  describe('sendMassNotification', () => {
    it('sends notifications to all users of a specific role', async () => {
      prisma.user.findMany.mockResolvedValue([
        mockUser({ id: 'user-1' }),
        mockUser({ id: 'user-2' }),
      ]);
      prisma.notification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.sendMassNotification({
        title: 'Mantenimiento',
        body: 'Plataforma en mantenimiento',
        role: 'CLIENT',
      });

      expect(result.sent).toBe(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'CLIENT' } }),
      );
    });

    it('sends notifications to all users when no role specified', async () => {
      prisma.user.findMany.mockResolvedValue([
        mockUser({ id: 'user-1' }),
      ]);
      prisma.notification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.sendMassNotification({
        title: 'Aviso',
        body: 'Mensaje general',
      });

      expect(result.sent).toBe(1);
      const findCall = prisma.user.findMany.mock.calls[0][0];
      expect(findCall.where).toEqual({});
    });
  });

  describe('listBookings', () => {
    it('returns paginated bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking()]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.listBookings(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status', async () => {
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(0);

      await service.listBookings(1, 20, BookingStatus.COMPLETED);

      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe('toggleService', () => {
    it('toggles service active status', async () => {
      prisma.service.findUnique.mockResolvedValue(mockService({ active: true }));
      prisma.service.update.mockResolvedValue(mockService({ active: false }));

      const result = await service.toggleService('service-1');

      expect(result.active).toBe(false);
    });

    it('throws NotFoundException for non-existent service', async () => {
      prisma.service.findUnique.mockResolvedValue(null);

      await expect(service.toggleService('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
