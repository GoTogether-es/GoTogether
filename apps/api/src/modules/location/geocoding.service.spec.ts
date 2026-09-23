import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(() => {
    service = new GeocodingService();
  });

  it('debería instanciarse correctamente', () => {
    expect(service).toBeDefined();
  });

  it('debería devolver array vacío para queries muy cortas', async () => {
    const result = await service.search('Ma');
    expect(result).toEqual([]);
  });

  it('debería geocodificar ciudad + dirección completa (puede ser null)', async () => {
    const result = await service.geocode('Málaga', 'Calle Larios 1, 29005 Málaga');
    // Puede ser null si Nominatim falla, pero no debe lanzar
    expect(result === null || (typeof result === 'object' && 'latitude' in result)).toBe(true);
  });
});