import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UserRole } from '../../generated/client';
import { GeocodingService } from '../location/geocoding.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    await this.ensureUser(userId);

    const {
      isCompanion,
      specialties,
      backgroundCheck,
      sexualCheck,
      penalCertificate,
      sexualCertificate,
      role: requestedRole,
      city,
      fullAddress,
      ...profileData
    } = dto;

    // 1. Upsert base profile
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: { ...profileData, city },
      create: { ...profileData, userId, city },
    });

    const coords = await this.geocodingService.geocode(city, fullAddress);

    await this.prisma.userLocation.upsert({
      where: { userId },
      update: {
        city,
        fullAddress,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      },
      create: {
        userId,
        city,
        fullAddress,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      },
    });

    // 2. Handle companion profile and role in a transaction
    if (isCompanion) {
      await this.prisma.$transaction([
        this.prisma.companionProfile.upsert({
          where: { profileId: profile.id },
          update: { specialties, backgroundCheck, sexualCheck, penalCertificate, sexualCertificate },
          create: { profileId: profile.id, specialties, backgroundCheck, sexualCheck, penalCertificate, sexualCertificate },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { role: UserRole.COMPANION },
        }),
      ]);
    } else if (requestedRole === 'SUPERVISOR') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.SUPERVISOR },
      });
    } else {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role !== UserRole.SUPERVISOR && user.role !== UserRole.ADMIN) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { role: UserRole.CLIENT },
        });
      }
    }

    return this.getProfileByUserId(userId);
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { companion: true, user: { include: { privateLocation: true } } },
    });

    if (!profile) return null;

    return {
      ...profile,
      location: profile.user?.privateLocation
        ? {
            city: profile.user.privateLocation.city,
            fullAddress: profile.user.privateLocation.fullAddress,
            latitude: profile.user.privateLocation.latitude,
            longitude: profile.user.privateLocation.longitude,
          }
        : null,
    };
  }

  async listCompanions() {
    return this.prisma.companionProfile.findMany({
      where: { verified: true },
      include: {
        profile: {
          include: {
            user: { select: { id: true } }
          }
        },
        _count: { select: { bookings: true } }
      },
    });
  }

  async getCompanionById(companionId: string) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
      include: {
        profile: {
          include: { user: { select: { id: true, email: true } } },
        },
        bookings: {
          where: { status: 'COMPLETED' },
          select: { report: { select: { rating: true } } },
        },
      },
    });

    if (!companion) throw new NotFoundException('Acompañante no encontrado');

    const ratings = companion.bookings
      .map((b) => b.report?.rating)
      .filter((r): r is number => r !== null && r !== undefined);

    const completedServices = companion.bookings.length;
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    return {
      ...companion,
      completedServices,
      averageRating,
      recentRatings: ratings.slice(-5),
    };
  }

  private async ensureUser(userId: string) {
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@placeholder.gotogether` },
    });
  }
}
