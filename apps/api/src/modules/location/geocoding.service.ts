import { Injectable, Logger } from '@nestjs/common';

type GeoPoint = { latitude: number; longitude: number };

export interface GeocodeResult {
  placeId: string;
  displayName: string;
  city: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly cache = new Map<string, GeoPoint>();
  private readonly searchCache = new Map<string, GeocodeResult[]>();
  private lastRequestAt = 0;

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly MIN_REQUEST_INTERVAL_MS = 1100; // 1 req/s policy

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestAt;
    if (elapsed < this.MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, this.MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    this.lastRequestAt = Date.now();
  }

  private buildCityFromAddress(address: Record<string, string>): string {
    return (
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state_district ||
      address.state ||
      ''
    );
  }

  private async fetchNominatim(params: URLSearchParams): Promise<GeocodeResult[]> {
    await this.waitForRateLimit();

    const url = `${this.NOMINATIM_URL}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'User-Agent': 'GoTogether/1.0',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim error: ${response.status}`);
        return [];
      }

      const data = (await response.json()) as Array<{
        place_id: number;
        display_name: string;
        lat: string;
        lon: string;
        address?: Record<string, string>;
      }>;

      return data
        .filter((item) => item.lat && item.lon)
        .map((item) => ({
          placeId: String(item.place_id),
          displayName: item.display_name,
          city: this.buildCityFromAddress(item.address ?? {}),
          fullAddress: item.display_name,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        }));
    } catch (err) {
      this.logger.error('Nominatim fetch failed', err);
      return [];
    }
  }

  async search(query: string): Promise<GeocodeResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) return [];

    const key = trimmed.toLowerCase();
    const cached = this.searchCache.get(key);
    if (cached) return cached;

    const params = new URLSearchParams({
      format: 'jsonv2',
      limit: '5',
      addressdetails: '1',
      countrycodes: 'es',
      q: trimmed,
    });

    const results = await this.fetchNominatim(params);
    this.searchCache.set(key, results);
    return results;
  }

  async geocode(city: string, fullAddress: string): Promise<GeoPoint | null> {
    const key = `${city.trim().toLowerCase()}|${fullAddress.trim().toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const query = encodeURIComponent(`${fullAddress}, ${city}, España`);
    const params = new URLSearchParams({
      format: 'jsonv2',
      limit: '1',
      addressdetails: '1',
      countrycodes: 'es',
      q: query,
    });

    const results = await this.fetchNominatim(params);
    const first = results[0];

    if (!first) return null;

    const point = {
      latitude: first.latitude,
      longitude: first.longitude,
    };

    if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
      this.cache.set(key, point);
      return point;
    }

    return null;
  }
}
