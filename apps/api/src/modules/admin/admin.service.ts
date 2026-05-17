import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
}
