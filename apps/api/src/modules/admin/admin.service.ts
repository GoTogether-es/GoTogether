import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../auth/mail.service';
import { getVerificationApprovedTemplate, getVerificationRejectedTemplate } from '../auth/mail.templates';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async getStats() {
    const [users, profiles, companions, pendingCompanions, pendingProfiles, verifiedProfiles] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.profile.count(),
      this.prisma.companionProfile.count(),
      this.prisma.companionProfile.count({ where: { verified: false } }),
      this.prisma.profile.count({ where: { verified: false } }),
      this.prisma.profile.count({ where: { verified: true } }),
    ]);

    return {
      users,
      profiles,
      companions,
      pendingCompanions,
      pendingProfiles,
      verifiedProfiles,
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