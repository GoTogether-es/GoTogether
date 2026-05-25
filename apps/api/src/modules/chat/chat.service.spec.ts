import { ChatService } from './chat.service';
import { createMockPrismaService } from '../../__mocks__/prisma';
import { mockBooking, mockProfile, mockCompanionProfile, mockSupervision } from '../../test-utils/factories';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new ChatService(prisma as any);
  });

  describe('getOrCreateRoom', () => {
    it('returns existing room', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ clientId: 'client-1' }));
      prisma.chatRoom.upsert.mockResolvedValue({ id: 'room-1', bookingId: 'booking-1' });

      const result = await service.getOrCreateRoom('booking-1', 'client-1');
      expect(result).toHaveProperty('id', 'room-1');
    });

    it('creates room if none exists', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ clientId: 'client-1' }));
      prisma.chatRoom.upsert.mockResolvedValue({ id: 'room-new', bookingId: 'booking-1' });

      const result = await service.getOrCreateRoom('booking-1', 'client-1');
      expect(result).toHaveProperty('id', 'room-new');
      expect(prisma.chatRoom.upsert).toHaveBeenCalled();
    });

    it('throws ForbiddenException for non-participant', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ clientId: 'client-1', bookedById: 'client-1' }));
      prisma.supervision.findFirst.mockResolvedValue(null);

      await expect(service.getOrCreateRoom('booking-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('allows supervisor to access', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ clientId: 'client-1' }));
      prisma.supervision.findFirst.mockResolvedValue(mockSupervision({ supervisorId: 'supervisor-1', clientId: 'client-1' }));
      prisma.chatRoom.upsert.mockResolvedValue({ id: 'room-1', bookingId: 'booking-1' });

      const result = await service.getOrCreateRoom('booking-1', 'supervisor-1');
      expect(result).toHaveProperty('id', 'room-1');
    });
  });

  describe('saveMessage', () => {
    it('saves a message for a valid participant', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue({ id: 'room-1', bookingId: 'booking-1', booking: mockBooking() });
      prisma.booking.findUnique.mockResolvedValue(mockBooking({ clientId: 'sender-1' }));
      prisma.chatMessage.create.mockResolvedValue({ id: 'msg-1', content: 'Hola' });

      const result = await service.saveMessage('room-1', 'sender-1', 'Hola');
      expect(result.content).toBe('Hola');
    });

    it('throws NotFoundException for non-existent room', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue(null);

      await expect(service.saveMessage('bad-room', 'user-1', 'Hola')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRoomForBooking', () => {
    it('returns existing room if it exists', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue({ id: 'room-1', bookingId: 'booking-1' });
      const result = await service.createRoomForBooking('booking-1');
      expect(result.id).toBe('room-1');
      expect(prisma.chatRoom.create).not.toHaveBeenCalled();
    });

    it('creates room if none exists', async () => {
      prisma.chatRoom.findUnique.mockResolvedValue(null);
      prisma.chatRoom.create.mockResolvedValue({ id: 'room-new', bookingId: 'booking-1' });
      const result = await service.createRoomForBooking('booking-1');
      expect(result.id).toBe('room-new');
    });
  });
});
