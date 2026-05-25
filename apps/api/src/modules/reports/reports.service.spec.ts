import { ReportsService } from './reports.service';
import { BookingStatus } from '../../generated/client';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { createMockNotificationsService } from '../../test-utils/services';
import { mockBooking, mockReport, mockCompanionProfile, mockProfile } from '../../test-utils/factories';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let notifications: ReturnType<typeof createMockNotificationsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createMockPrismaService();
    prisma.$transaction = jest.fn((arg: any) => {
      if (typeof arg === 'function') return arg(prisma);
      return Promise.all(arg.map((q: any) => q));
    });
    notifications = createMockNotificationsService();
    service = new ReportsService(prisma as any, notifications as any);
  });

  describe('create', () => {
    const createDto = { rating: 5, summary: 'Excelente' };

    it('creates a report for a COMPLETED booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.COMPLETED, clientId: 'client-1', report: null }),
      );
      prisma.report.create.mockResolvedValue(mockReport({ id: 'report-new' }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user' } }),
      );
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.companionProfile.update.mockResolvedValue(mockCompanionProfile());

      const result = await service.create('booking-1', 'client-1', createDto as any);

      expect(result).toHaveProperty('id', 'report-new');
      expect(prisma.report.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ rating: 5 }) }),
      );
    });

    it('throws BadRequestException if booking is not COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.IN_PROGRESS, clientId: 'client-1' }),
      );

      await expect(service.create('booking-1', 'client-1', createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if report already exists', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.COMPLETED, clientId: 'client-1', report: mockReport() }),
      );

      await expect(service.create('booking-1', 'client-1', createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException if booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create('booking-1', 'client-1', createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if user is not the client or supervisor', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.COMPLETED, clientId: 'client-1', report: null }),
      );
      prisma.supervision.findFirst.mockResolvedValue(null);

      await expect(service.create('booking-1', 'other-user', createDto as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows supervisor of client to create report', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.COMPLETED, clientId: 'client-1', report: null }),
      );
      prisma.supervision.findFirst.mockResolvedValue({ id: 'sup-1', supervisorId: 'supervisor-1', clientId: 'client-1' });
      prisma.report.create.mockResolvedValue(mockReport({ id: 'report-new' }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user' } }),
      );
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.companionProfile.update.mockResolvedValue(mockCompanionProfile());

      const result = await service.create('booking-1', 'supervisor-1', createDto as any);

      expect(result).toHaveProperty('id', 'report-new');
      expect(prisma.report.create).toHaveBeenCalledTimes(1);
    });

    it('recalculates companion rating on report creation', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({
          status: BookingStatus.COMPLETED,
          clientId: 'client-1',
          companionId: 'comp-1',
          report: null,
        }),
      );
      prisma.report.create.mockResolvedValue(mockReport({ id: 'report-new' }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user' } }),
      );
      prisma.booking.findMany.mockResolvedValue([mockBooking()]);
      prisma.report.findUnique.mockResolvedValue(mockReport({ rating: 5 }));
      prisma.companionProfile.update.mockResolvedValue(mockCompanionProfile());

      await service.create('booking-1', 'client-1', createDto as any);

      expect(prisma.companionProfile.update).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates own report', async () => {
      const report = mockReport({
        id: 'report-1',
        bookingId: 'booking-1',
        booking: { clientId: 'client-1', companionId: 'comp-1' },
      });
      prisma.report.findUnique.mockResolvedValue(report);
      prisma.report.update.mockResolvedValue({ ...report, rating: 4 });
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.companionProfile.update.mockResolvedValue(mockCompanionProfile());

      const result = await service.update('report-1', 'client-1', { rating: 4 } as any);

      expect(result.rating).toBe(4);
    });

    it('throws NotFoundException for non-existent report', async () => {
      prisma.report.findUnique.mockResolvedValue(null);

      await expect(service.update('report-1', 'client-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if not the client', async () => {
      prisma.report.findUnique.mockResolvedValue(
        mockReport({ id: 'report-1', booking: { clientId: 'client-1', companionId: null } }),
      );
      prisma.supervision.findFirst.mockResolvedValue(null);

      await expect(service.update('report-1', 'other-user', {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('recalculateCompanionRating', () => {
    it('computes correct average from multiple ratings', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({
          status: BookingStatus.COMPLETED,
          clientId: 'client-1',
          companionId: 'comp-1',
          report: null,
        }),
      );
      prisma.report.create.mockResolvedValue(mockReport({ id: 'report-new' }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user' } }),
      );
      prisma.booking.findMany.mockResolvedValue([
        { ...mockBooking(), report: { rating: 5 }, createdAt: new Date('2024-01-01') },
        { ...mockBooking(), report: { rating: 3 }, createdAt: new Date('2024-02-01') },
      ]);
      prisma.companionProfile.update.mockResolvedValue(mockCompanionProfile());

      await service.create('booking-1', 'client-1', { rating: 5 } as any);

      const updateCall = prisma.companionProfile.update.mock.calls[0][0];
      expect(updateCall.data.rating).toBe(4);
      expect(updateCall.data.yearsOnPlatform).toBeGreaterThanOrEqual(0);
    });
  });
});
