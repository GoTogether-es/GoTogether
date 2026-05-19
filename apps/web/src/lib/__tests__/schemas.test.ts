import { solicitudSchema, perfilSchema, valoracionSchema, validateFutureDate } from '@/lib/schemas';

describe('solicitudSchema', () => {
  it('valida datos correctos', () => {
    const result = solicitudSchema.safeParse({
      serviceId: 'svc-123',
      address: 'Calle Mayor 1, Madrid',
      date: '2026-06-15',
      time: '10:00',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza serviceId vacío', () => {
    const result = solicitudSchema.safeParse({
      serviceId: '',
      address: 'Calle Mayor 1',
      date: '2026-06-15',
      time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza dirección muy corta', () => {
    const result = solicitudSchema.safeParse({
      serviceId: 'svc-456',
      address: 'Ca',
      date: '2026-06-15',
      time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('permite campos opcionales vacíos', () => {
    const result = solicitudSchema.safeParse({
      serviceId: 'svc-789',
      address: 'Plaza Mayor',
      date: '2026-06-15',
      time: '14:00',
      disability: undefined,
      notes: undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe('perfilSchema', () => {
  it('valida perfil con datos correctos', () => {
    const result = perfilSchema.safeParse({
      fullName: 'Juan Pérez',
      headline: 'Jubilado',
      bio: 'Me gusta pasear',
      phone: '+34 600 000 000',
      isCompanion: false,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza fullName vacío', () => {
    const result = perfilSchema.safeParse({
      fullName: '',
    });
    expect(result.success).toBe(false);
  });

  it('permite companion con specialties', () => {
    const result = perfilSchema.safeParse({
      fullName: 'María López',
      isCompanion: true,
      specialties: 'Cocina, enfermería',
    });
    expect(result.success).toBe(true);
  });
});

describe('valoracionSchema', () => {
  it('valida rating correcto', () => {
    const result = valoracionSchema.safeParse({ rating: 5 });
    expect(result.success).toBe(true);
  });

  it('rechaza rating 0', () => {
    const result = valoracionSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it('rechaza rating > 5', () => {
    const result = valoracionSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });

  it('permite summary opcional', () => {
    const result = valoracionSchema.safeParse({ rating: 4, summary: 'Todo bien' });
    expect(result.success).toBe(true);
  });
});

describe('validateFutureDate', () => {
  it('retorna null para fecha futura', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];
    expect(validateFutureDate(date, '10:00')).toBeNull();
  });

  it('retorna error para fecha pasada', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];
    expect(validateFutureDate(date, '10:00')).toBe('La fecha debe ser futura');
  });

  it('retorna null para campos vacíos', () => {
    expect(validateFutureDate('', '')).toBeNull();
    expect(validateFutureDate('2026-06-15', '')).toBeNull();
    expect(validateFutureDate('', '10:00')).toBeNull();
  });

  it('retorna null para fecha inválida', () => {
    expect(validateFutureDate('not-a-date', '10:00')).toBeNull();
  });
});
