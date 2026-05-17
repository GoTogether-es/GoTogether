import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { BookingStatus } from '../../generated/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string) {
    return this.prisma.report.findMany({
      include: {
        booking: {
          select: {
            id: true,
            serviceType: true,
            companionId: true,
            companion: {
              select: {
                profile: { select: { fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

    const isParticipant = await this.isParticipant(booking, userId);
    if (!isParticipant) {
      throw new ForbiddenException('No eres participante de esta reserva');
    }

    return this.prisma.report.findUnique({
      where: { bookingId },
    });
  }

  async create(bookingId: string, userId: string, dto: CreateReportDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { report: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Solo se pueden valorar servicios completados');
    }

    if (booking.report) {
      throw new BadRequestException('Esta reserva ya tiene una valoración');
    }

    const isClient = booking.clientId === userId;
    const isSupervisedClient = await this.isSupervisorOf(userId, booking.clientId);

    if (!isClient && !isSupervisedClient) {
      throw new ForbiddenException('Solo el cliente puede valorar el servicio');
    }

    const report = await this.prisma.report.create({
      data: {
        bookingId,
        rating: dto.rating,
        summary: dto.summary,
      },
    });

    if (booking.companionId) {
      await this.recalculateCompanionRating(booking.companionId);
    }

    return report;
  }

  async update(reportId: string, userId: string, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { booking: true },
    });
    if (!report) throw new NotFoundException('Valoración no encontrada');

    const isClient = report.booking.clientId === userId;
    const isSupervisedClient = await this.isSupervisorOf(userId, report.booking.clientId);

    if (!isClient && !isSupervisedClient) {
      throw new ForbiddenException('Solo el cliente puede editar su valoración');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        rating: dto.rating,
        summary: dto.summary,
      },
    });

    if (report.booking.companionId) {
      await this.recalculateCompanionRating(report.booking.companionId);
    }

    return updated;
  }

  private async recalculateCompanionRating(companionId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { companionId, status: BookingStatus.COMPLETED },
      include: { report: { select: { rating: true } } },
    });

    const ratings = bookings
      .map((b) => b.report?.rating)
      .filter((r): r is number => r !== null && r !== undefined);

    const average =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

    const completedDates = bookings.map((b) => b.createdAt.getTime());
    const firstCompleted = completedDates.length > 0 ? Math.min(...completedDates) : Date.now();
    const yearsOnPlatform = Math.floor((Date.now() - firstCompleted) / (365 * 24 * 60 * 60 * 1000));

    await this.prisma.companionProfile.update({
      where: { id: companionId },
      data: { rating: average, yearsOnPlatform },
    });
  }

  private async isParticipant(
    booking: { clientId: string; companionId: string | null; bookedById: string | null },
    userId: string,
  ) {
    if (booking.clientId === userId) return true;
    if (booking.bookedById === userId) return true;

    if (booking.companionId) {
      const companion = await this.prisma.companionProfile.findUnique({
        where: { id: booking.companionId },
        include: { profile: true },
      });
      if (companion?.profile?.userId === userId) return true;
    }

    return this.isSupervisorOf(userId, booking.clientId);
  }

  private async isSupervisorOf(supervisorId: string, clientId: string) {
    const supervision = await this.prisma.supervision.findFirst({
      where: { supervisorId, clientId },
    });
    return !!supervision;
  }
}
