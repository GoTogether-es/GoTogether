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
import { PaymentsService } from '../payments/payments.service';
import { ChatService } from '../chat/chat.service';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: [BookingStatus.REQUESTED, BookingStatus.CANCELLED],
  REQUESTED: [BookingStatus.ACCEPTED, BookingStatus.DECLINED, BookingStatus.CANCELLED],
  ACCEPTED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  DECLINED: [],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

const DEFAULT_AMOUNT_CENTS = 2500;
const PLATFORM_FEE_PERCENT = 12;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
    private readonly chatService: ChatService,
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

  async requestBooking(bookingId: string, amountCents = DEFAULT_AMOUNT_CENTS) {
    const booking = await this.findById(bookingId);
    if (booking.status !== BookingStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden solicitar reservas en borrador');
    }

    const paymentIntent = await this.payments.createHold(amountCents, 'eur');
    const fee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));

    await this.prisma.payment.create({
      data: {
        bookingId,
        stripePaymentId: paymentIntent.id,
        amount: amountCents,
        fee,
        currency: 'EUR',
        status: 'HOLD',
      },
    });

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REQUESTED },
      include: { payment: true },
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
    const isSupervisedClient = await this.isSupervisorOf(userId, booking.clientId);

    switch (dto.status) {
      case BookingStatus.REQUESTED:
        if (!isClient && !isSupervisedClient) throw new ForbiddenException('Solo el cliente puede solicitar');
        break;
      case BookingStatus.ACCEPTED:
        if (!isCompanion) throw new ForbiddenException('Solo el acompañante puede aceptar');
        await this.chatService.createRoomForBooking(bookingId);
        break;
      case BookingStatus.DECLINED:
        if (!isCompanion) throw new ForbiddenException('Solo el acompañante puede rechazar');
        break;
      case BookingStatus.IN_PROGRESS:
        if (!isCompanion) throw new ForbiddenException('Solo el acompañante puede iniciar el servicio');
        break;
      case BookingStatus.COMPLETED:
        if (!isCompanion && !isClient) throw new ForbiddenException('Solo participantes pueden completar');

        if (booking.payment?.stripePaymentId) {
          await this.payments.capturePayment(booking.payment.stripePaymentId);
          await this.prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'CAPTURED' },
          });
        }
        break;
      case BookingStatus.CANCELLED:
        if (!isClient && !isCompanion && !isSupervisedClient) {
          throw new ForbiddenException('No tienes permiso para cancelar');
        }

        if (booking.payment?.stripePaymentId && booking.payment.status === 'HOLD') {
          await this.payments.releasePayment(booking.payment.stripePaymentId);
          await this.prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'RELEASED' },
          });
        }
        break;
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: dto.status },
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
