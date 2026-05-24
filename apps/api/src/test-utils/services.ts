import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { MailService } from '../modules/auth/mail.service';
import { ChatService } from '../modules/chat/chat.service';
import { AvailabilityService } from '../modules/availability/availability.service';

export function createMockConfigService(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    RESEND_API_KEY: 're_test',
    RESEND_FROM: 'test@test.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  };
  const merged = { ...defaults, ...overrides };

  return {
    get: jest.fn((key: string) => merged[key] ?? null),
  } as unknown as ConfigService;
}

export function createMockNotificationsService() {
  return {
    create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    findByUser: jest.fn().mockResolvedValue([]),
    countUnread: jest.fn().mockResolvedValue(0),
    markRead: jest.fn().mockResolvedValue(undefined),
    markAllRead: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationsService;
}

export function createMockMailService() {
  return {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  } as unknown as MailService;
}

export function createMockChatService() {
  return {
    getOrCreateRoom: jest.fn().mockResolvedValue({ id: 'room-1', bookingId: 'booking-1' }),
    saveMessage: jest.fn().mockResolvedValue({ id: 'msg-1', content: 'test' }),
    getMessages: jest.fn().mockResolvedValue([]),
    createRoomForBooking: jest.fn().mockResolvedValue({ id: 'room-1', bookingId: 'booking-1' }),
  } as unknown as ChatService;
}

export function createMockAvailabilityService() {
  return {
    isCompanionAvailable: jest.fn().mockResolvedValue(true),
    getForCompanion: jest.fn().mockResolvedValue([]),
    setForCompanion: jest.fn().mockResolvedValue([]),
  } as unknown as AvailabilityService;
}
