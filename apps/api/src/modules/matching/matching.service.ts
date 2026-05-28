import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/client';

export interface RecommendQuery {
  search?: string;
  disabilityType?: string;
  minRating?: number;
  verified?: boolean;
  city?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendCompanions(query: RecommendQuery) {
    const { search, disabilityType, minRating, verified, city, latitude, longitude, page = 1, limit = 9 } = query;

    const where: Prisma.CompanionProfileWhereInput = {};

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (verified === true) {
      where.verified = true;
    }

    const profileConditions: Prisma.ProfileWhereInput[] = [];

    if (search) {
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

    if (city) {
      profileConditions.push({ city: { equals: city, mode: 'insensitive' } });
    }

    if (profileConditions.length > 0) {
      where.profile = { AND: profileConditions };
    }

    const [data, total] = await Promise.all([
      this.prisma.companionProfile.findMany({
        where,
        include: {
          profile: {
            include: { user: { select: { id: true, privateLocation: true } } },
          },
        },
        orderBy: [{ rating: 'desc' }, { yearsOnPlatform: 'desc' }],
      }),
      this.prisma.companionProfile.count({ where }),
    ]);

    const scored = data
      .map((companion) => ({
        companion,
        score: this.scoreCompanion({ companion, city, latitude, longitude }),
        distance: this.distanceKm(
          latitude ?? undefined,
          longitude ?? undefined,
          companion.profile?.user?.privateLocation?.latitude,
          companion.profile?.user?.privateLocation?.longitude,
        ),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        if (a.distance !== b.distance) return a.distance - b.distance;
        return (b.companion.rating ?? 0) - (a.companion.rating ?? 0);
      })
      .map(({ companion }) => companion);

    const skip = (page - 1) * limit;
    const paginated = scored.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private distanceKm(
    fromLat?: number,
    fromLng?: number,
    toLat?: number | null,
    toLng?: number | null,
  ): number | null {
    if (fromLat == null || fromLng == null || toLat == null || toLng == null) return null;

    const earthRadiusKm = 6371;
    const dLat = ((toLat - fromLat) * Math.PI) / 180;
    const dLng = ((toLng - fromLng) * Math.PI) / 180;
    const lat1 = (fromLat * Math.PI) / 180;
    const lat2 = (toLat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  private scoreCompanion(params: {
    companion: { verified: boolean; rating: number; yearsOnPlatform: number; profile?: { city?: string | null; user?: { privateLocation?: { latitude: number | null; longitude: number | null } | null } | null } | null };
    city?: string;
    latitude?: number;
    longitude?: number;
  }): number {
    const { companion, city, latitude, longitude } = params;
    const distance = this.distanceKm(
      latitude,
      longitude,
      companion.profile?.user?.privateLocation?.latitude,
      companion.profile?.user?.privateLocation?.longitude,
    );

    const distanceScore = distance === null ? 0 : Math.max(0, 40 - Math.min(distance, 40));
    const ratingScore = (companion.rating / 5) * 30;
    const verifiedScore = companion.verified ? 10 : 0;
    const cityScore = city && companion.profile?.city?.toLowerCase() === city.toLowerCase() ? 10 : 0;
    const experienceScore = Math.min(companion.yearsOnPlatform, 10);

    return distanceScore + ratingScore + verifiedScore + cityScore + experienceScore;
  }
}
