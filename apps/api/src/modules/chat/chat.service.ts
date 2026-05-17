import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateRoom(bookingId: string, userId: string) {
    await this.validateParticipant(bookingId, userId);

    let room = await this.prisma.chatRoom.findUnique({
      where: { bookingId },
    });

    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: { bookingId },
      });
    }

    return room;
  }

  async getMessages(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { booking: true },
    });
    if (!room) throw new NotFoundException('Sala de chat no encontrada');

    await this.validateParticipant(room.bookingId, userId);

    const booking = await this.prisma.booking.findUnique({
      where: { id: room.bookingId },
      include: {
        client: { include: { profile: true } },
        companion: { include: { profile: true } },
      },
    });

    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    return { room, booking, messages };
  }

  async saveMessage(roomId: string, senderId: string, content: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { booking: true },
    });
    if (!room) throw new NotFoundException('Sala de chat no encontrada');

    await this.validateParticipant(room.bookingId, senderId);

    return this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
      },
    });
  }

  async createRoomForBooking(bookingId: string) {
    const existing = await this.prisma.chatRoom.findUnique({
      where: { bookingId },
    });
    if (existing) return existing;

    return this.prisma.chatRoom.create({
      data: { bookingId },
    });
  }

  private async validateParticipant(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

    if (booking.clientId === userId) return;
    if (booking.bookedById === userId) return;

    if (booking.companionId) {
      const companion = await this.prisma.companionProfile.findUnique({
        where: { id: booking.companionId },
        include: { profile: true },
      });
      if (companion?.profile?.userId === userId) return;
    }

    const supervision = await this.prisma.supervision.findFirst({
      where: { supervisorId: userId, clientId: booking.clientId },
    });
    if (supervision) return;

    throw new ForbiddenException('No eres participante de esta reserva');
  }
}
