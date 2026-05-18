import { z } from 'zod';

const profileSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  disabilityType: z.string().nullable(),
  preferences: z.string().nullable(),
  companion: z.object({
    specialties: z.string().nullable(),
    verified: z.boolean(),
    backgroundCheck: z.string().nullable(),
    rating: z.number(),
    yearsOnPlatform: z.number(),
  }).nullable().optional(),
});

const companionSummarySchema = z.object({
  id: z.string(),
  profile: z.object({
    fullName: z.string(),
    headline: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
  }),
  specialties: z.string().nullable(),
  rating: z.number(),
  yearsOnPlatform: z.number(),
  verified: z.boolean(),
});

const bookingSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  companionId: z.string().nullable(),
  bookedById: z.string().nullable(),
  status: z.string(),
  serviceType: z.string(),
  summary: z.string().nullable(),
  address: z.string(),
  scheduledAt: z.string(),
  disability: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

describe('profileSchema', () => {
  it('validates correct profile', () => {
    const result = profileSchema.safeParse({
      id: 'abc-123',
      fullName: 'Juan',
      headline: null,
      bio: null,
      phone: null,
      disabilityType: null,
      preferences: null,
    });
    expect(result.success).toBe(true);
  });

  it('allows null companion', () => {
    const result = profileSchema.safeParse({
      id: 'abc-123',
      fullName: 'Juan',
      headline: null,
      bio: null,
      phone: null,
      disabilityType: null,
      preferences: null,
      companion: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = profileSchema.safeParse({
      fullName: 'Juan',
    });
    expect(result.success).toBe(false);
  });
});

describe('companionSummarySchema', () => {
  it('validates correct companion summary', () => {
    const result = companionSummarySchema.safeParse({
      id: 'comp-1',
      profile: {
        fullName: 'María',
      },
      specialties: 'Cocina',
      rating: 4.5,
      yearsOnPlatform: 2,
      verified: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing profile.fullName', () => {
    const result = companionSummarySchema.safeParse({
      id: 'comp-1',
      profile: {},
      specialties: null,
      rating: 0,
      yearsOnPlatform: 0,
      verified: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('bookingSchema', () => {
  it('validates correct booking', () => {
    const result = bookingSchema.safeParse({
      id: 'booking-1',
      clientId: 'user-1',
      companionId: null,
      bookedById: null,
      status: 'DRAFT',
      serviceType: 'Médico',
      summary: null,
      address: 'Calle Mayor',
      scheduledAt: '2026-06-15T10:00:00.000Z',
      disability: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('allows nullable companionId', () => {
    const result = bookingSchema.safeParse({
      id: 'booking-1',
      clientId: 'user-1',
      companionId: 'comp-1',
      bookedById: null,
      status: 'ACCEPTED',
      serviceType: 'Ocio',
      summary: 'Paseo',
      address: 'Plaza',
      scheduledAt: '2026-06-15T10:00:00.000Z',
      disability: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = bookingSchema.safeParse({ id: 'b-1' });
    expect(result.success).toBe(false);
  });
});
