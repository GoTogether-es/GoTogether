import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../auth/mail.service';
import { getVerificationApprovedTemplate, getVerificationRejectedTemplate } from '../auth/mail.templates';
import type { BookingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async getStats() {
    const [users, profiles, companions, pendingCompanions, pendingProfiles, verifiedProfiles,
      totalBookings, activeBookings, completedBookings, totalPayments, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.profile.count(),
      this.prisma.companionProfile.count(),
      this.prisma.companionProfile.count({ where: { verified: false } }),
      this.prisma.profile.count({ where: { verified: false } }),
      this.prisma.profile.count({ where: { verified: true } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'] } } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      users,
      profiles,
      companions,
      pendingCompanions,
      pendingProfiles,
      verifiedProfiles,
      totalBookings,
      activeBookings,
      completedBookings,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: { include: { companion: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPending() {
    const companions = await this.prisma.companionProfile.findMany({
      where: { verified: false },
      include: {
        profile: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const clients = await this.prisma.profile.findMany({
      where: {
        verified: false,
        disabilityDocument: { not: null },
        companion: null,
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return { companions, clients };
  }

  // --- Bookings ---

  async listBookings(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          client: { include: { profile: true } },
          companion: { include: { profile: true } },
          service: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: { include: { profile: true } },
        companion: { include: { profile: true } },
        service: true,
        payment: true,
        report: true,
        chatRoom: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
      },
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');
    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Reserva no encontrada');
    return this.prisma.booking.update({ where: { id }, data: { status } });
  }

  // --- Services ---

  async listServices() {
    return this.prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createService(data: { name: string; description?: string; price: number; category?: string }) {
    return this.prisma.service.create({ data: { ...data, active: true } });
  }

  async updateService(id: string, data: { name?: string; description?: string; price?: number; category?: string }) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.service.update({ where: { id }, data });
  }

  async toggleService(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.service.update({ where: { id }, data: { active: !service.active } });
  }

  // --- Payments ---

  async listPayments(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        include: {
          booking: {
            include: {
              client: { include: { profile: true } },
              companion: { include: { profile: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // --- Reports ---

  async listReports(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        include: {
          booking: {
            include: {
              client: { include: { profile: true } },
              companion: { include: { profile: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async deleteReport(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Valoración no encontrada');
    return this.prisma.report.delete({ where: { id } });
  }

  // --- Notifications ---

  async sendMassNotification(data: { title: string; body: string; role?: string }) {
    const where: any = {};
    if (data.role) where.role = data.role;

    const users = await this.prisma.user.findMany({ where, select: { id: true } });

    const notifications = await Promise.all(
      users.map((u) =>
        this.prisma.notification.create({
          data: { userId: u.id, type: 'admin', title: data.title, body: data.body },
        }),
      ),
    );

    return { sent: notifications.length };
  }

  // --- Verification (existing) ---

  async verifyCompanion(companionId: string) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
      include: { profile: { include: { user: true } } },
    });
    if (!companion) throw new NotFoundException('Acompañante no encontrado');

    const result = await this.prisma.companionProfile.update({
      where: { id: companionId },
      data: { verified: true },
    });

    if (companion.profile?.user) {
      const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      await this.mailService.sendEmail(
        companion.profile.user.email,
        'Verificación aprobada - GoTogether',
        getVerificationApprovedTemplate({
          userName: companion.profile.fullName || 'Usuario',
          appUrl,
        }),
      );
    }

    return result;
  }

  async rejectCompanion(companionId: string) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
      include: { profile: { include: { user: true } } },
    });
    if (!companion) throw new NotFoundException('Acompañante no encontrado');

    const result = await this.prisma.companionProfile.update({
      where: { id: companionId },
      data: { verified: false },
    });

    if (companion.profile?.user) {
      const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      await this.mailService.sendEmail(
        companion.profile.user.email,
        'Verificación rechazada - GoTogether',
        getVerificationRejectedTemplate({
          userName: companion.profile.fullName || 'Usuario',
          appUrl,
        }),
      );
    }

    return result;
  }

  async verifyProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    const result = await this.prisma.profile.update({
      where: { id: profileId },
      data: { verified: true },
    });

    if (profile.user) {
      const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      await this.mailService.sendEmail(
        profile.user.email,
        'Verificación aprobada - GoTogether',
        getVerificationApprovedTemplate({
          userName: profile.fullName || 'Usuario',
          appUrl,
        }),
      );
    }

    return result;
  }

  async rejectProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    const result = await this.prisma.profile.update({
      where: { id: profileId },
      data: { verified: false },
    });

    if (profile.user) {
      const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
      await this.mailService.sendEmail(
        profile.user.email,
        'Verificación rechazada - GoTogether',
        getVerificationRejectedTemplate({
          userName: profile.fullName || 'Usuario',
          appUrl,
        }),
      );
    }

    return result;
  }
}