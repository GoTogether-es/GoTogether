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

/** Normaliza texto para comparaciones: minúsculas, sin acentos ni espacios sobrantes. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

    // disabilityType se resuelve en SQL; city y search se resuelven en JS tras
    // la consulta para que coincidan ignorando acentos (p. ej. "Malaga" ===
    // "Málaga") y mayúsculas, que `mode: 'insensitive'` no cubre.
    if (disabilityType) {
      where.profile = { disabilityType: { equals: disabilityType, mode: 'insensitive' } };
    }

    const data = await this.prisma.companionProfile.findMany({
      where,
      include: {
        profile: {
          include: { user: { select: { id: true, privateLocation: true } } },
        },
        availabilitySlots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
      orderBy: [{ rating: 'desc' }, { yearsOnPlatform: 'desc' }],
    });

    let filtered = data;

    if (search) {
      const term = normalize(search);
      filtered = filtered.filter((companion) =>
        [companion.profile?.fullName, companion.profile?.headline, companion.profile?.bio].some(
          (value) => value != null && normalize(value).includes(term),
        ),
      );
    }

    if (city) {
      const targetCity = normalize(city);
      filtered = filtered.filter(
        (companion) => companion.profile?.city != null && normalize(companion.profile.city) === targetCity,
      );
    }

    const total = filtered.length;
    const scored = filtered
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
    const cityScore = city && companion.profile?.city && normalize(companion.profile.city) === normalize(city) ? 10 : 0;
    const experienceScore = Math.min(companion.yearsOnPlatform, 10);

    return distanceScore + ratingScore + verifiedScore + cityScore + experienceScore;
  }
}
