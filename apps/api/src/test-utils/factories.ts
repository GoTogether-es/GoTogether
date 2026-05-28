import type { BookingStatus, UserRole } from '../generated/client';

export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'test@test.com',
    role: 'CLIENT' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function mockProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'profile-1',
    userId: 'user-1',
    fullName: 'Test User',
    city: 'Madrid',
    headline: 'Test Headline',
    bio: 'Test bio',
    phone: '+34 600 000 000',
    avatarUrl: null,
    disabilityType: null,
    disabilityDescription: null,
    disabilityDocument: null,
    preferences: null,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    companion: null,
    user: null,
    ...overrides,
  };
}

export function mockCompanionProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'companion-1',
    profileId: 'profile-1',
    specialties: 'Cocina, enfermería',
    verified: false,
    backgroundCheck: null,
    sexualCheck: null,
    penalCertificate: null,
    sexualCertificate: null,
    rating: 4.5,
    yearsOnPlatform: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: mockProfile(),
    ...overrides,
  };
}

export function mockBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-1',
    clientId: 'user-1',
    companionId: null,
    bookedById: 'user-1',
    serviceId: null,
    status: 'DRAFT' as BookingStatus,
    serviceType: 'Acompañamiento médico',
    summary: null,
    address: 'Calle Mayor 1, Madrid',
    scheduledAt: new Date('2026-06-15T10:00:00.000Z'),
    disability: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: null,
    companion: null,
    bookedBy: null,
    service: null,
    payment: null,
    report: null,
    chatRoom: null,
    ...overrides,
  };
}

export function mockService(overrides: Record<string, unknown> = {}) {
  return {
    id: 'service-1',
    name: 'Acompañamiento médico',
    description: 'Acompañamiento a consultas médicas',
    price: 1500,
    category: 'Salud',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function mockReport(overrides: Record<string, unknown> = {}) {
  return {
    id: 'report-1',
    bookingId: 'booking-1',
    summary: 'Excelente servicio',
    rating: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function mockNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-1',
    userId: 'user-1',
    type: 'booking_requested',
    title: 'Nueva solicitud',
    body: 'Has recibido una solicitud',
    bookingId: null,
    read: false,
    createdAt: new Date(),
    ...overrides,
  };
}

export function mockSupervision(overrides: Record<string, unknown> = {}) {
  return {
    id: 'supervision-1',
    supervisorId: 'supervisor-1',
    clientId: 'client-1',
    createdAt: new Date(),
    supervisor: null,
    client: null,
    ...overrides,
  };
}

export function mockSupervisionInvite(overrides: Record<string, unknown> = {}) {
  return {
    id: 'invite-1',
    supervisorId: 'supervisor-1',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    clientId: null,
    token: 'uuid-token-12345',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
