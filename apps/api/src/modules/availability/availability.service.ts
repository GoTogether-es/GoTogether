import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class AvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getForCompanion(companionId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { companionId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async setForCompanion(userId: string, slots: AvailabilitySlotDto[]) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { companion: true },
    });

    if (!profile?.companion) {
      throw new ForbiddenException('Solo los acompañantes pueden configurar disponibilidad');
    }

    const companionId = profile.companion.id;

    await this.prisma.availabilitySlot.deleteMany({ where: { companionId } });

    if (slots.length > 0) {
      await this.prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({ companionId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })),
      });
    }

    return this.getForCompanion(companionId);
  }

  async isCompanionAvailable(companionId: string, scheduledAt: Date): Promise<boolean> {
    const dayOfWeek = scheduledAt.getDay();
    const timeStr = `${String(scheduledAt.getHours()).padStart(2, '0')}:${String(scheduledAt.getMinutes()).padStart(2, '0')}`;

    const slot = await this.prisma.availabilitySlot.findFirst({
      where: {
        companionId,
        dayOfWeek,
        startTime: { lte: timeStr },
        endTime: { gte: timeStr },
      },
    });

    return !!slot;
  }
}
