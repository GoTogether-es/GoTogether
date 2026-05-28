import { Injectable } from '@nestjs/common';

type GeoPoint = { latitude: number; longitude: number };

@Injectable()
export class GeocodingService {
  private readonly cache = new Map<string, GeoPoint>();

  async geocode(city: string, fullAddress: string): Promise<GeoPoint | null> {
    const key = `${city.trim().toLowerCase()}|${fullAddress.trim().toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const query = encodeURIComponent(`${fullAddress}, ${city}, Espana`);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=es&q=${query}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'User-Agent': 'GoTogether/1.0',
        },
      });

      if (!response.ok) return null;

      const data = (await response.json()) as Array<{ lat: string; lon: string }>;
      const first = data[0];
      if (!first) return null;

      const point = {
        latitude: Number(first.lat),
        longitude: Number(first.lon),
      };

      if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
        this.cache.set(key, point);
        return point;
      }

      return null;
    } catch {
      return null;
    }
  }
}
