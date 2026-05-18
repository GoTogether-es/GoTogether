import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { profile: { fullName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    return this.prisma.user.findMany({ where, include: { profile: true } });
  }
}