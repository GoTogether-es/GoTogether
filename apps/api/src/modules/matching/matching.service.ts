import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/client';

export interface RecommendQuery {
  search?: string;
  disabilityType?: string;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendCompanions(query: RecommendQuery) {
    const { search, disabilityType, minRating, verified, page = 1, limit = 9 } = query;

    const where: Prisma.CompanionProfileWhereInput = {};

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (verified === true) {
      where.verified = true;
    }

    if (search || disabilityType) {
      const profileConditions: Prisma.ProfileWhereInput[] = [];

      if (search) {
        const term = `%${search}%`;
        profileConditions.push({
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { headline: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      if (disabilityType) {
        profileConditions.push({ disabilityType: { equals: disabilityType, mode: 'insensitive' } });
      }

      if (profileConditions.length > 0) {
        where.profile = { AND: profileConditions };
      }
    }

    if (search) {
      const term = `%${search}%`;
      if (!where.profile) {
        where.profile = {};
      }
      const existingAND = (where.profile as any).AND || [];
      (where.profile as any).OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
      if (disabilityType) {
        (where.profile as any).AND = [
          ...(Array.isArray(existingAND) ? existingAND : [existingAND]),
          { disabilityType: { equals: disabilityType, mode: 'insensitive' } },
        ];
      }
    } else if (disabilityType && !where.profile) {
      where.profile = { disabilityType: { equals: disabilityType, mode: 'insensitive' } };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.companionProfile.findMany({
        where,
        include: {
          profile: {
            include: { user: { select: { id: true, email: true } } },
          },
        },
        orderBy: [{ rating: 'desc' }, { yearsOnPlatform: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.companionProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
