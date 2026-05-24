import { SupervisionService } from './supervision.service';
import { UserRole } from '../../generated/client';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { createMockConfigService } from '../../test-utils/services';
import { mockUser, mockProfile, mockSupervision, mockSupervisionInvite, mockBooking } from '../../test-utils/factories';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn() },
  })),
}));

describe('SupervisionService', () => {
  let service: SupervisionService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createMockPrismaService();
    configService = createMockConfigService();
    service = new SupervisionService(prisma as any, configService as any);
  });

  describe('createSupervision', () => {
    it('creates supervision for a valid supervisor and client', async () => {
      const supervisor = mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR });
      const client = mockUser({ id: 'client-1', role: UserRole.CLIENT });

      prisma.user.findUnique
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(client);
      prisma.supervision.findUnique.mockResolvedValue(null);
      prisma.supervision.create.mockResolvedValue(
        mockSupervision({ supervisorId: 'supervisor-1', clientId: 'client-1' }),
      );
      prisma.user.update.mockResolvedValue(supervisor);

      const result = await service.createSupervision('supervisor-1', { clientId: 'client-1' });

      expect(result.supervisorId).toBe('supervisor-1');
      expect(result.clientId).toBe('client-1');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.SUPERVISOR } }),
      );
    });

    it('throws ForbiddenException when trying to supervise yourself', async () => {
      const user = mockUser({ id: 'user-1', role: UserRole.SUPERVISOR });
      prisma.user.findUnique
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(user);
      prisma.supervision.findUnique.mockResolvedValue(null);

      await expect(
        service.createSupervision('user-1', { clientId: 'user-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when client is already a SUPERVISOR', async () => {
      const supervisor = mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR });
      const client = mockUser({ id: 'client-1', role: UserRole.SUPERVISOR });

      prisma.user.findUnique
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(client);
      prisma.supervision.findUnique.mockResolvedValue(null);

      await expect(
        service.createSupervision('supervisor-1', { clientId: 'client-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when client already has a supervisor', async () => {
      const supervisor = mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR });
      const client = mockUser({ id: 'client-1', role: UserRole.CLIENT });

      prisma.user.findUnique
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(client);
      prisma.supervision.findUnique.mockResolvedValue(
        mockSupervision({ supervisorId: 'other-sup', clientId: 'client-1' }),
      );

      await expect(
        service.createSupervision('supervisor-1', { clientId: 'client-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ForbiddenException if user is not a SUPERVISOR', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'user-1', role: UserRole.CLIENT }));

      await expect(
        service.createSupervision('user-1', { clientId: 'client-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('inviteSupervision', () => {
    it('creates an invite with token and sends email', async () => {
      const supervisor = mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR, email: 'sup@test.com' });
      prisma.user.findUnique
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(supervisor);
      prisma.supervisionInvite.create.mockResolvedValue(mockSupervisionInvite());
      prisma.profile.findUnique.mockResolvedValue(mockProfile({ fullName: 'Supervisor Name' }));
      prisma.user.update.mockResolvedValue(supervisor);

      const result = await service.inviteSupervision('supervisor-1', {
        clientName: 'Test Client',
        clientEmail: 'client@test.com',
      });

      expect(result).toHaveProperty('token');
      expect(result.clientName).toBe('Test Client');
      expect(prisma.supervisionInvite.create).toHaveBeenCalledTimes(1);
    });

    it('promotes user to SUPERVISOR role', async () => {
      const supervisor = mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR });
      prisma.user.findUnique
        .mockResolvedValueOnce(supervisor)
        .mockResolvedValueOnce(supervisor);
      prisma.supervisionInvite.create.mockResolvedValue(mockSupervisionInvite());
      prisma.profile.findUnique.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue(supervisor);

      await service.inviteSupervision('supervisor-1', { clientName: 'Test' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: UserRole.SUPERVISOR } }),
      );
    });
  });

  describe('acceptInvitation', () => {
    it('accepts a valid PENDING invitation', async () => {
      const invite = mockSupervisionInvite({
        token: 'valid-token',
        supervisorId: 'supervisor-1',
        status: 'PENDING',
      });
      prisma.supervisionInvite.findUnique.mockResolvedValue(invite);
      prisma.supervision.findUnique.mockResolvedValue(null);
      prisma.supervision.create.mockResolvedValue(
        mockSupervision({ supervisorId: 'supervisor-1', clientId: 'client-1' }),
      );
      prisma.supervisionInvite.update.mockResolvedValue({ ...invite, status: 'ACCEPTED' });

      const result = await service.acceptInvitation('valid-token', 'client-1');

      expect(result.success).toBe(true);
      expect(prisma.supervisionInvite.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ACCEPTED', clientId: 'client-1' },
        }),
      );
    });

    it('throws NotFoundException for invalid token', async () => {
      prisma.supervisionInvite.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvitation('bad-token', 'client-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if already accepted', async () => {
      prisma.supervisionInvite.findUnique.mockResolvedValue(
        mockSupervisionInvite({ status: 'ACCEPTED' }),
      );

      await expect(service.acceptInvitation('token', 'client-1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if client already has a supervisor', async () => {
      prisma.supervisionInvite.findUnique.mockResolvedValue(mockSupervisionInvite({ status: 'PENDING' }));
      prisma.supervision.findUnique.mockResolvedValue(
        mockSupervision({ supervisorId: 'other', clientId: 'client-1' }),
      );

      await expect(service.acceptInvitation('token', 'client-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelInvitation', () => {
    it('cancels own invite', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR }));
      prisma.supervisionInvite.findUnique.mockResolvedValue(
        mockSupervisionInvite({ supervisorId: 'supervisor-1', status: 'PENDING' }),
      );
      prisma.supervisionInvite.update.mockResolvedValue(
        mockSupervisionInvite({ status: 'CANCELLED' }),
      );

      const result = await service.cancelInvitation('invite-1', 'supervisor-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('throws ForbiddenException if not the owner of the invite', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR }));
      prisma.supervisionInvite.findUnique.mockResolvedValue(
        mockSupervisionInvite({ supervisorId: 'other-sup' }),
      );

      await expect(service.cancelInvitation('invite-1', 'supervisor-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getClientBookings', () => {
    it('returns bookings for supervised clients', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR }));
      prisma.supervision.findMany.mockResolvedValue([
        { clientId: 'client-1' },
        { clientId: 'client-2' },
      ]);
      prisma.booking.findMany.mockResolvedValue([mockBooking()]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.getClientBookings('supervisor-1', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      const findManyCall = prisma.booking.findMany.mock.calls[0][0];
      expect(findManyCall.where.clientId.in).toEqual(['client-1', 'client-2']);
    });

    it('returns empty result when supervisor has no clients', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ id: 'supervisor-1', role: UserRole.SUPERVISOR }));
      prisma.supervision.findMany.mockResolvedValue([]);

      const result = await service.getClientBookings('supervisor-1', 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
