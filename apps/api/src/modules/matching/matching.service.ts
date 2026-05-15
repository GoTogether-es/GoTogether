import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendCompanions() {
    return this.prisma.companionProfile.findMany({
      include: { profile: true },
      orderBy: [{ rating: 'desc' }, { yearsOnPlatform: 'desc' }],
      take: 6,
    });
  }
}
