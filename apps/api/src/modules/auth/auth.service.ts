import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndSyncUser(supabaseUser: { userId: string; email: string }) {
    // Sync Supabase user with our local Prisma database
    return this.prisma.user.upsert({
      where: { id: supabaseUser.userId },
      update: { email: supabaseUser.email },
      create: {
        id: supabaseUser.userId,
        email: supabaseUser.email,
      },
    });
  }
}
