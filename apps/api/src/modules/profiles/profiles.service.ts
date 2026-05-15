import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    const { isCompanion, specialties, ...profileData } = dto;

    // 1. Upsert base profile
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: { ...profileData },
      create: { ...profileData, userId },
    });

    // 2. Handle companion profile
    if (isCompanion) {
      await this.prisma.companionProfile.upsert({
        where: { profileId: profile.id },
        update: { specialties },
        create: { profileId: profile.id, specialties },
      });

      // Update user role to COMPANION
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.COMPANION },
      });
    } else {
      // If was companion but now isn't? (Optional: could delete companionProfile, but safer to just keep CLIENT role)
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.CLIENT },
      });
    }

    return this.getProfileByUserId(userId);
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: { companion: true },
    });
  }

  listCompanions() {
    return this.prisma.companionProfile.findMany({
      include: {
        profile: {
          include: {
            user: true
          }
        }
      },
    });
  }
}
