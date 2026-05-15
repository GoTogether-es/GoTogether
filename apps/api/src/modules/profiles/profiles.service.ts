import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  listCompanions() {
    return this.prisma.companionProfile.findMany({
      include: { profile: true },
    });
  }
}
