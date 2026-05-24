import { BookingsService } from './bookings.service';
import { BookingStatus, UserRole } from '../../generated/client';
import { createMockPrismaService } from '../../__mocks__/prisma';
import {
  createMockConfigService,
  createMockNotificationsService,
  createMockMailService,
  createMockChatService,
  createMockAvailabilityService,
} from '../../test-utils/services';
import { mockUser, mockBooking, mockService, mockProfile, mockCompanionProfile } from '../../test-utils/factories';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let chatService: ReturnType<typeof createMockChatService>;
  let notifications: ReturnType<typeof createMockNotificationsService>;
  let mailService: ReturnType<typeof createMockMailService>;
  let configService: ReturnType<typeof createMockConfigService>;
  let availabilityService: ReturnType<typeof createMockAvailabilityService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createMockPrismaService();
    chatService = createMockChatService();
    notifications = createMockNotificationsService();
    mailService = createMockMailService();
    configService = createMockConfigService();
    availabilityService = createMockAvailabilityService();

    service = new BookingsService(
      prisma as any,
      chatService as any,
      notifications as any,
      mailService as any,
      configService as any,
      availabilityService as any,
    );
  });

  describe('create', () => {
    const createDto = {
      serviceType: 'Acompañamiento médico',
      address: 'Calle Mayor 1, Madrid',
      scheduledAt: '2026-06-15T10:00:00.000Z',
      summary: 'Necesito ayuda',
      disability: 'Movilidad reducida',
    };

    it('creates a booking successfully as CLIENT', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      prisma.booking.create.mockResolvedValue(mockBooking({ id: 'booking-new' }));

      const result = await service.create('user-1', createDto as any);

      expect(prisma.booking.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'booking-new');
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createDto as any)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when SUPERVISOR tries to create for themselves', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.SUPERVISOR }));

      await expect(service.create('user-1', createDto as any)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when serviceId references non-existent service', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      prisma.service.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', { ...createDto, serviceId: 'bad-service' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when service is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      prisma.service.findUnique.mockResolvedValue(mockService({ active: false }));

      await expect(
        service.create('user-1', { ...createDto, serviceId: 'service-1' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when companion is not available', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      availabilityService.isCompanionAvailable.mockResolvedValue(false);

      await expect(
        service.create('user-1', { ...createDto, companionId: 'companion-1' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('resolves serviceType from service when serviceId is provided', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ role: UserRole.CLIENT }));
      prisma.service.findUnique.mockResolvedValue(mockService({ name: 'Fisioterapia', id: 'svc-1' }));
      prisma.booking.create.mockResolvedValue(mockBooking({ id: 'b-1' }));

      await service.create('user-1', { ...createDto, serviceId: 'svc-1' } as any);

      const createCall = prisma.booking.create.mock.calls[0][0];
      expect(createCall.data.serviceType).toBe('Fisioterapia');
      expect(createCall.data.serviceId).toBe('svc-1');
    });
  });

  describe('findByUser', () => {
    it('returns bookings for a CLIENT', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.findMany.mockResolvedValue([mockBooking()]);

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(1);
      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({ clientId: 'user-1' });
    });

    it('returns bookings for a COMPANION via companionProfile', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.COMPANION, id: 'user-1' });
      prisma.companionProfile.findFirst.mockResolvedValue({ id: 'comp-1' });
      prisma.booking.findMany.mockResolvedValue([]);

      await service.findByUser('user-1');

      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({ companionId: 'comp-1' });
    });

    it('throws NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findByUser('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('returns booking when found', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ id: 'b-1' }));

      const result = await service.findById('b-1');

      expect(result).toHaveProperty('id', 'b-1');
    });

    it('throws NotFoundException when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findById('b-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOpenBookings', () => {
    it('returns REQUESTED bookings with no companion assigned', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking({ status: BookingStatus.REQUESTED })]);

      const result = await service.findOpenBookings();

      expect(result).toHaveLength(1);
      const call = prisma.booking.findMany.mock.calls[0][0];
      expect(call.where.status).toBe(BookingStatus.REQUESTED);
      expect(call.where.companionId).toBeNull();
    });
  });

  describe('requestBooking', () => {
    it('transitions DRAFT to REQUESTED and notifies companion', async () => {
      const booking = mockBooking({
        status: BookingStatus.DRAFT,
        companionId: 'comp-1',
        client: { profile: { fullName: 'Juan' } },
      });
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.booking.update.mockResolvedValue(mockBooking({ status: BookingStatus.REQUESTED }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user-1' } }),
      );

      const result = await service.requestBooking('b-1');

      expect(result).toHaveProperty('status', BookingStatus.REQUESTED);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'booking_requested', userId: 'comp-user-1' }),
      );
    });

    it('throws BadRequestException if booking is not DRAFT', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ status: BookingStatus.REQUESTED }));

      await expect(service.requestBooking('b-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus — state machine and permissions', () => {
    const baseBooking = mockBooking({
      id: 'b-1',
      clientId: 'client-1',
      companionId: null,
      status: BookingStatus.DRAFT,
      client: { profile: { fullName: 'Juan' } },
    });

    beforeEach(() => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.booking.update.mockResolvedValue(baseBooking);
    });

    // --- REQUESTED from DRAFT ---
    it('allows CLIENT to request (DRAFT -> REQUESTED)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT, profile: null } as any));
      baseBooking.status = BookingStatus.DRAFT;

      prisma.booking.findUnique.mockResolvedValue(baseBooking);

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.REQUESTED } as any, 'client-1'),
      ).resolves.toBeDefined();
    });

    it('forbids non-client from requesting', async () => {
      prisma.user.findUnique.mockResolvedValue(
        mockUser({ id: 'other-1', role: UserRole.CLIENT, profile: null } as any),
      );
      prisma.supervision.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.REQUESTED } as any, 'other-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    // --- ACCEPTED from REQUESTED ---
    it('allows COMPANION to accept (REQUESTED -> ACCEPTED)', async () => {
      const compProfile = mockCompanionProfile({ id: 'comp-1' });
      baseBooking.status = BookingStatus.REQUESTED;
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          role: UserRole.COMPANION,
          profile: { ...mockProfile(), companion: compProfile, id: 'profile-comp', fullName: 'María' },
        } as any),
      );

      await service.updateStatus('b-1', { status: BookingStatus.ACCEPTED } as any, 'comp-user-1');

      expect(chatService.createRoomForBooking).toHaveBeenCalledWith('b-1');
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'booking_accepted' }),
      );
    });

    it('allows COMPANION to claim an open booking (no companionId)', async () => {
      const compProfile = mockCompanionProfile({ id: 'comp-1' });
      baseBooking.status = BookingStatus.REQUESTED;
      baseBooking.companionId = null;
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          role: UserRole.COMPANION,
          profile: { ...mockProfile(), companion: compProfile, id: 'profile-comp', fullName: 'María' },
        } as any),
      );

      await service.updateStatus('b-1', { status: BookingStatus.ACCEPTED } as any, 'comp-user-1');

      const updateCall = prisma.booking.update.mock.calls[0][0];
      expect(updateCall.data.companionId).toBe('comp-1');
    });

    it('forbids non-companion from accepting', async () => {
      baseBooking.status = BookingStatus.REQUESTED;
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT } as any));

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.ACCEPTED } as any, 'client-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    // --- DECLINED from REQUESTED ---
    it('allows COMPANION to decline', async () => {
      const compProfile = mockCompanionProfile({ id: 'comp-1' });
      baseBooking.status = BookingStatus.REQUESTED;
      baseBooking.companionId = 'comp-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          role: UserRole.COMPANION,
          profile: { ...mockProfile(), companion: compProfile, id: 'profile-comp', fullName: 'María' },
        } as any),
      );

      await service.updateStatus('b-1', { status: BookingStatus.DECLINED } as any, 'comp-user-1');

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'booking_declined' }),
      );
    });

    // --- IN_PROGRESS from ACCEPTED ---
    it('allows COMPANION to start service (ACCEPTED -> IN_PROGRESS)', async () => {
      const compProfile = mockCompanionProfile({ id: 'comp-1' });
      baseBooking.status = BookingStatus.ACCEPTED;
      baseBooking.companionId = 'comp-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          role: UserRole.COMPANION,
          profile: { ...mockProfile(), companion: compProfile, id: 'profile-comp', fullName: 'María' },
        } as any),
      );

      await service.updateStatus('b-1', { status: BookingStatus.IN_PROGRESS } as any, 'comp-user-1');

      const updateCall = prisma.booking.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(BookingStatus.IN_PROGRESS);
    });

    it('forbids non-companion from starting service', async () => {
      baseBooking.status = BookingStatus.ACCEPTED;
      baseBooking.companionId = 'comp-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT } as any));

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.IN_PROGRESS } as any, 'client-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    // --- COMPLETED from IN_PROGRESS ---
    it('allows COMPANION to complete service', async () => {
      const compProfile = mockCompanionProfile({ id: 'comp-1' });
      baseBooking.status = BookingStatus.IN_PROGRESS;
      baseBooking.companionId = 'comp-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          role: UserRole.COMPANION,
          profile: { ...mockProfile(), companion: compProfile, id: 'profile-comp', fullName: 'María' },
        } as any),
      );

      await service.updateStatus('b-1', { status: BookingStatus.COMPLETED } as any, 'comp-user-1');

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'booking_completed' }),
      );
    });

    // --- CANCELLED ---
    it('allows CLIENT to cancel their own booking', async () => {
      baseBooking.status = BookingStatus.REQUESTED;
      baseBooking.clientId = 'client-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT, profile: null } as any));

      await service.updateStatus('b-1', { status: BookingStatus.CANCELLED } as any, 'client-1');

      const updateCall = prisma.booking.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(BookingStatus.CANCELLED);
    });

    it('forbids unrelated user from cancelling', async () => {
      baseBooking.status = BookingStatus.REQUESTED;
      baseBooking.clientId = 'client-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'other-1', role: UserRole.CLIENT } as any));
      prisma.supervision.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.CANCELLED } as any, 'other-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    // --- Invalid transitions ---
    it('throws BadRequestException for invalid transition COMPLETED -> CANCELLED', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ status: BookingStatus.COMPLETED, clientId: 'client-1' }));
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT, profile: null } as any));

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.CANCELLED } as any, 'client-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid transition DRAFT -> COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ status: BookingStatus.DRAFT, clientId: 'client-1' }));
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', role: UserRole.CLIENT, profile: null } as any));

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.COMPLETED } as any, 'client-1'),
      ).rejects.toThrow(BadRequestException);
    });

    // --- Supervisor delegation ---
    it('allows SUPERVISOR to request on behalf of supervised client', async () => {
      baseBooking.status = BookingStatus.DRAFT;
      baseBooking.clientId = 'client-1';
      prisma.booking.findUnique.mockResolvedValue(baseBooking);
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR, profile: null } as any));
      prisma.supervision.findFirst.mockResolvedValue({ id: 'sup-1', supervisorId: 'supervisor-1', clientId: 'client-1' });

      await expect(
        service.updateStatus('b-1', { status: BookingStatus.REQUESTED } as any, 'supervisor-1'),
      ).resolves.toBeDefined();
    });
  });

  describe('findHistory', () => {
    it('returns paginated history for a CLIENT', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.findMany.mockResolvedValue([mockBooking()]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.findHistory('user-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('filters by status when provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(0);

      await service.findHistory('user-1', { status: BookingStatus.COMPLETED });

      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe(BookingStatus.COMPLETED);
    });

    it('applies correct pagination skip and take', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.booking.count.mockResolvedValue(26);

      await service.findHistory('user-1', { page: 3, limit: 10 });

      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.skip).toBe(20);
      expect(findManyCall.take).toBe(10);
    });
  });

  describe('getStats', () => {
    it('returns stats for a CLIENT', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);
      prisma.report.aggregate.mockResolvedValue({ _avg: { rating: 4.2 } });

      const result = await service.getStats('user-1');

      expect(result.completed).toBe(5);
      expect(result.withRating).toBe(3);
      expect(result.averageRating).toBe(4.2);
    });

    it('returns null averageRating when no ratings', async () => {
      prisma.user.findUnique.mockResolvedValue({ role: UserRole.CLIENT, id: 'user-1' });
      prisma.booking.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.report.aggregate.mockResolvedValue({ _avg: { rating: null } });

      const result = await service.getStats('user-1');

      expect(result.averageRating).toBeNull();
    });
  });

  describe('requestCompletion', () => {
    it('allows assigned companion to request completion', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.IN_PROGRESS, companionId: 'comp-1', clientId: 'client-1' }),
      );
      prisma.user.findUnique.mockResolvedValue(
        mockUser({
          id: 'comp-user-1',
          profile: { ...mockProfile(), fullName: 'María', companion: { id: 'comp-1' } },
        } as any),
      );

      const result = await service.requestCompletion('b-1', 'comp-user-1');

      expect(result.success).toBe(true);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'completion_requested' }),
      );
    });

    it('throws BadRequestException if booking is not IN_PROGRESS', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ status: BookingStatus.COMPLETED }));

      await expect(service.requestCompletion('b-1', 'comp-user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if user is not the assigned companion', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.IN_PROGRESS, companionId: 'comp-1' }),
      );
      prisma.user.findUnique.mockResolvedValue(mockUser({ profile: null } as any));

      await expect(service.requestCompletion('b-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('completeByClient', () => {
    it('allows client to confirm completion', async () => {
      const booking = mockBooking({
        status: BookingStatus.IN_PROGRESS,
        clientId: 'client-1',
        companionId: 'comp-1',
        serviceType: 'Médico',
      });
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.booking.update.mockResolvedValue(mockBooking({ status: BookingStatus.COMPLETED }));
      prisma.companionProfile.findUnique.mockResolvedValue(
        mockCompanionProfile({ profile: { ...mockProfile(), userId: 'comp-user-1', fullName: 'María' } }),
      );
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'client-1', email: 'client@test.com' }));

      const result = await service.completeByClient('b-1', 'client-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(notifications.create).toHaveBeenCalledTimes(2);
    });

    it('throws BadRequestException if not IN_PROGRESS', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ status: BookingStatus.COMPLETED }));

      await expect(service.completeByClient('b-1', 'client-1')).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if not the client', async () => {
      prisma.booking.findUnique.mockResolvedValue(
        mockBooking({ status: BookingStatus.IN_PROGRESS, clientId: 'client-1' }),
      );

      await expect(service.completeByClient('b-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
});
