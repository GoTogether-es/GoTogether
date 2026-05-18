import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
    });
    if (!companion) throw new NotFoundException('Acompañante no encontrado');

    return this.prisma.companionProfile.update({
      where: { id: companionId },
      data: { verified: true },
    });
  }

  async rejectCompanion(companionId: string) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
    });
    if (!companion) throw new NotFoundException('Acompañante no encontrado');

    return this.prisma.companionProfile.update({
      where: { id: companionId },
      data: { verified: false },
    });
  }

  async verifyProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { verified: true },
    });
  }

  async rejectProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { verified: false },
    });
  }
}