import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GeocodingService, GeocodeResult } from './geocoding.service';

export interface GeocodeSuggestion {
  id: string;
  displayName: string;
  city: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

@Controller('location')
export class LocationController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('geocode')
  @UseInterceptors(CacheInterceptor)
  async geocode(@Query('q') q: string): Promise<GeocodeSuggestion[]> {
    if (!q || q.trim().length < 3) {
      return [];
    }
    const results = await this.geocodingService.search(q.trim());
    return results.map((r): GeocodeSuggestion => ({
      id: r.placeId,
      displayName: r.displayName,
      city: r.city,
      fullAddress: r.fullAddress,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  }
}