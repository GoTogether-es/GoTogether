import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus, UserRole } from '../../generated/client';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../auth/mail.service';
import { AvailabilityService } from '../availability/availability.service';
import {
  getBookingAcceptedTemplate,
  getBookingDeclinedTemplate,
  getBookingCompletedTemplate,
  getBookingCancelledTemplate,
} from '../auth/mail.templates';

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
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === UserRole.SUPERVISOR) {
      throw new ForbiddenException(
        'Los supervisores no pueden crear reservas para sí mismos. Usa el endpoint de supervisión para crear reservas en nombre de tu cliente.',
      );
    }

    let serviceType = dto.serviceType;
    let serviceId: string | null = null;

    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
      if (!service) throw new NotFoundException('Servicio no encontrado');
      if (!service.active) throw new BadRequestException('Este servicio no está disponible');
      serviceType = service.name;
      serviceId = service.id;
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (dto.companionId) {
      const isAvailable = await this.availabilityService.isCompanionAvailable(dto.companionId, scheduledDate);
      if (!isAvailable) {
        throw new ConflictException('El acompañante no está disponible en ese horario');
      }
    }

    return this.prisma.booking.create({
      data: {
        clientId: userId,
        bookedById: userId,
        companionId: dto.companionId || null,
        serviceId,
        serviceType,
        address: dto.address,
        scheduledAt: scheduledDate,
        summary: dto.summary,
        disability: dto.disability,
      },
      include: { payment: true, service: true },
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
        this.sendBookingEmail(booking, 'accepted', user.profile?.fullName);
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
        this.sendBookingEmail(booking, 'declined', user.profile?.fullName);
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
          this.sendBookingEmail(booking, 'completed', user.profile.fullName);
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
          this.sendBookingEmail(booking, 'cancelled', user.profile?.fullName);
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

  async findHistory(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const where: any = {};

    if (user.role === UserRole.COMPANION) {
      const companion = await this.prisma.companionProfile.findFirst({
        where: { profile: { userId } },
        select: { id: true },
      });
      where.companionId = companion?.id || '__none__';
    } else {
      where.clientId = userId;
    }

    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          client: { include: { profile: true } },
          companion: { include: { profile: true } },
          report: true,
          service: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const where: any = { status: BookingStatus.COMPLETED };

    if (user.role === UserRole.COMPANION) {
      const companion = await this.prisma.companionProfile.findFirst({
        where: { profile: { userId } },
        select: { id: true },
      });
      where.companionId = companion?.id || '__none__';
    } else {
      where.clientId = userId;
    }

    const [completed, withRating, ratingData] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.count({ where: { ...where, report: { isNot: null } } }),
      this.prisma.report.aggregate({
        _avg: { rating: true },
        where: { booking: where },
      }),
    ]);

    return {
      completed,
      withRating,
      averageRating: ratingData._avg.rating
        ? Math.round(ratingData._avg.rating * 10) / 10
        : null,
    };
  }

  private async sendBookingEmail(
    booking: Awaited<ReturnType<BookingsService['findById']>>,
    event: 'accepted' | 'declined' | 'completed' | 'cancelled',
    actorName?: string | null,
  ) {
    try {
      const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      const clientUser = await this.prisma.user.findUnique({ where: { id: booking.clientId } });
      if (!clientUser) return;

      const userName = booking.client?.profile?.fullName || 'Usuario';
      const serviceType = booking.serviceType;
      const companionName = booking.companion?.profile?.fullName || actorName || 'Acompañante';

      let subject = '';
      let html = '';

      switch (event) {
        case 'accepted':
          subject = 'Reserva aceptada - GoTogether';
          html = getBookingAcceptedTemplate({
            userName,
            companionName,
            serviceType,
            scheduledAt: booking.scheduledAt.toLocaleString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long',
              hour: '2-digit', minute: '2-digit',
            }),
            appUrl,
          });
          break;
        case 'declined':
          subject = 'Reserva rechazada - GoTogether';
          html = getBookingDeclinedTemplate({ userName, companionName, serviceType, appUrl });
          break;
        case 'completed':
          subject = 'Servicio completado - GoTogether';
          html = getBookingCompletedTemplate({ userName, companionName, serviceType, appUrl });
          break;
        case 'cancelled':
          subject = 'Reserva cancelada - GoTogether';
          html = getBookingCancelledTemplate({ userName, cancelledBy: companionName, serviceType, appUrl });
          break;
      }

      if (subject && html) {
        await this.mailService.sendEmail(clientUser.email, subject, html);
      }
    } catch (err) {
      console.error('BookingsService: failed to send email:', err);
    }
  }

  async requestCompletion(bookingId: string, userId: string) {
    const booking = await this.findById(bookingId);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Solo se puede solicitar finalizar servicios en curso');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { companion: true } } },
    });
    if (!user?.profile?.companion || booking.companionId !== user.profile.companion.id) {
      throw new ForbiddenException('Solo el acompañante asignado puede solicitar finalizar');
    }

    await this.notifications.create({
      userId: booking.clientId,
      type: 'completion_requested',
      title: 'Solicitud de finalización',
      body: `${user.profile.fullName} ha solicitado finalizar el servicio. Confírmalo cuando esté todo listo.`,
      bookingId,
    });

    return { success: true, message: 'Solicitud enviada al cliente' };
  }

  async completeByClient(bookingId: string, userId: string) {
    const booking = await this.findById(bookingId);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Solo se puede finalizar servicios en curso');
    }
    if (booking.clientId !== userId) {
      throw new ForbiddenException('Solo el cliente puede confirmar la finalización');
    }

    const companion = booking.companionId
      ? await this.prisma.companionProfile.findUnique({
          where: { id: booking.companionId },
          include: { profile: true },
        })
      : null;

    const result = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
      include: { payment: true },
    });

    if (companion) {
      await this.notifications.create({
        userId: companion.profile!.userId,
        type: 'booking_completed',
        title: 'Servicio finalizado',
        body: 'El cliente ha confirmado la finalización del servicio.',
        bookingId,
      });
    }

    await this.notifications.create({
      userId: booking.clientId,
      type: 'booking_completed',
      title: 'Servicio completado',
      body: '¡Servicio finalizado! Valora a tu acompañante.',
      bookingId,
    });

    if (booking.companionId && companion?.profile) {
      try {
        const clientUser = await this.prisma.user.findUnique({ where: { id: booking.clientId } });
        if (clientUser) {
          const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
          await this.mailService.sendEmail(
            clientUser.email,
            'Servicio completado - GoTogether',
            getBookingCompletedTemplate({
              userName: clientUser.email,
              companionName: companion.profile.fullName || 'Acompañante',
              serviceType: booking.serviceType,
              appUrl,
            }),
          );
        }
      } catch (err) {
        console.error('Failed to send completion email:', err);
      }
    }

    return result;
  }
}