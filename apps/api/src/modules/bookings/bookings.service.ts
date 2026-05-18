import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus, UserRole } from '../../generated/client';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: [BookingStatus.REQUESTED, BookingStatus.CANCELLED],
  REQUESTED: [BookingStatus.ACCEPTED, BookingStatus.DECLINED, BookingStatus.CANCELLED],
  ACCEPTED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  DECLINED: [],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === UserRole.SUPERVISOR) {
      throw new ForbiddenException(
        'Los supervisores no pueden crear reservas para sí mismos. Usa el endpoint de supervisión para crear reservas en nombre de tu cliente.',
      );
    }

    return this.prisma.booking.create({
      data: {
        clientId: userId,
        bookedById: userId,
        companionId: dto.companionId || null,
        serviceType: dto.serviceType,
        address: dto.address,
        scheduledAt: new Date(dto.scheduledAt),
        summary: dto.summary,
        disability: dto.disability,
      },
      include: { payment: true },
    });
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === UserRole.COMPANION) {
      const companion = await this.prisma.companionProfile.findFirst({
        where: { profile: { userId } },
        select: { id: true },
      });
      return this.prisma.booking.findMany({
        where: { companionId: companion?.id || '__none__' },
        include: { client: { include: { profile: true } }, payment: true, report: true, chatRoom: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.booking.findMany({
      where: { clientId: userId },
      include: { companion: { include: { profile: true } }, payment: true, report: true, chatRoom: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: { include: { profile: true } },
        companion: { include: { profile: true } },
        bookedBy: { include: { profile: true } },
        payment: true,
        report: true,
        chatRoom: true,
      },
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');
    return booking;
  }

  async findOpenBookings() {
    return this.prisma.booking.findMany({
      where: { status: BookingStatus.REQUESTED, companionId: null },
      include: {
        client: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestBooking(bookingId: string) {
    const booking = await this.findById(bookingId);
    if (booking.status !== BookingStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden solicitar reservas en borrador');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REQUESTED },
      include: { payment: true },
    }).then(async (result) => {
      if (booking.companionId) {
        const companion = await this.prisma.companionProfile.findUnique({
          where: { id: booking.companionId },
          include: { profile: true },
        });
        if (companion?.profile) {
          await this.notifications.create({
            userId: companion.profile.userId,
            type: 'booking_requested',
            title: 'Nueva solicitud',
            body: `${booking.client?.profile?.fullName || 'Un cliente'} te ha solicitado un servicio`,
            bookingId,
          });
        }
      }
      return result;
    });
  }

  async updateStatus(bookingId: string, dto: UpdateBookingStatusDto, userId: string) {
    const booking = await this.findById(bookingId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { companion: true } } },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const allowed = VALID_TRANSITIONS[booking.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `No se puede cambiar de ${booking.status} a ${dto.status}`,
      );
    }

    const isClient = booking.clientId === userId;
    const isCompanion =
      user.profile?.companion && booking.companionId === user.profile.companion.id;
    const canClaim = user.profile?.companion && !booking.companionId;
    const isSupervisedClient = await this.isSupervisorOf(userId, booking.clientId);

    const updateData: any = { status: dto.status };

    switch (dto.status) {
      case BookingStatus.REQUESTED:
        if (!isClient && !isSupervisedClient) throw new ForbiddenException('Solo el cliente puede solicitar');
        break;
      case BookingStatus.ACCEPTED:
        if (!isCompanion && !canClaim) throw new ForbiddenException('Solo el acompañante puede aceptar');
        if (canClaim) updateData.companionId = user.profile!.companion!.id;
        await this.chatService.createRoomForBooking(bookingId);
        this.notifications.create({
          userId: booking.clientId,
          type: 'booking_accepted',
          title: 'Solicitud aceptada',
          body: `${user.profile?.fullName || 'Un acompañante'} ha aceptado tu solicitud`,
          bookingId,
        });
        break;
      case BookingStatus.DECLINED:
        if (!isCompanion && !canClaim) throw new ForbiddenException('Solo el acompañante puede rechazar');
        this.notifications.create({
          userId: booking.clientId,
          type: 'booking_declined',
          title: 'Solicitud rechazada',
          body: `${user.profile?.fullName || 'Un acompañante'} ha rechazado tu solicitud`,
          bookingId,
        });
        break;
      case BookingStatus.IN_PROGRESS:
        if (!isCompanion) throw new ForbiddenException('Solo el acompañante puede iniciar el servicio');
        break;
      case BookingStatus.COMPLETED:
        if (!isCompanion && !isClient) throw new ForbiddenException('Solo participantes pueden completar');
        if (booking.companionId && user.profile?.companion) {
          this.notifications.create({
            userId: booking.clientId,
            type: 'booking_completed',
            title: 'Servicio completado',
            body: `${user.profile.fullName} ha marcado el servicio como completado. ¡Valóralo!`,
            bookingId,
          });
        }
        break;
      case BookingStatus.CANCELLED:
        if (!isClient && !isCompanion && !isSupervisedClient) {
          throw new ForbiddenException('No tienes permiso para cancelar');
        }
        if (isCompanion && booking.clientId) {
          this.notifications.create({
            userId: booking.clientId,
            type: 'booking_cancelled',
            title: 'Reserva cancelada',
            body: `${user.profile?.fullName || 'El acompañante'} ha cancelado la reserva`,
            bookingId,
          });
        }
        break;
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: { payment: true },
    });
  }

  private async isSupervisorOf(supervisorId: string, clientId: string) {
    const supervision = await this.prisma.supervision.findFirst({
      where: { supervisorId, clientId },
    });
    return !!supervision;
  }
}