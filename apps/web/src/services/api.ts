import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import type {
  UserProfile,
  CompanionSummary,
  CompanionDetail,
  BookingData,
  ChatRoomData,
  ReportData,
  SupervisionData,
  SupervisorData,
  UserSearchResult,
  PaginatedResponse,
  HealthStatus,
  AdminStats,
  AdminUser,
  AdminPending,
  AdminBooking,
  AdminBookingDetail,
  AdminPayment,
  AdminReport,
  NotificationData,
  ServiceData,
  AvailabilitySlotData,
  BookingHistoryResponse,
  BookingStats,
} from '@/types';

const API_URL = env.apiUrl;

type FetchOptions = {
  signal?: AbortSignal;
};

let cachedSession: { token: string; expiresAt: number } | null = null;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedSession && cachedSession.expiresAt > now) {
    return {
      'Authorization': `Bearer ${cachedSession.token}`,
      'Content-Type': 'application/json',
    };
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    cachedSession = null;
    return {};
  }

  cachedSession = {
    token: session.access_token,
    expiresAt: (session.expires_at ?? 0) * 1000 - 30000,
  };

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

function validateResponse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(`[API] Schema validation failed for ${label}:`, result.error.flatten());
    return data as T;
  }
  return result.data;
}

const profileSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  disabilityType: z.string().nullable(),
  disabilityDescription: z.string().nullable(),
  disabilityDocument: z.string().nullable(),
  preferences: z.string().nullable(),
  companion: z.object({
    id: z.string(),
    specialties: z.string().nullable(),
    verified: z.boolean(),
    backgroundCheck: z.string().nullable(),
    penalCertificate: z.string().nullable(),
    sexualCertificate: z.string().nullable(),
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

const companionDetailSchema = z.object({
  id: z.string(),
  profile: z.object({
    fullName: z.string(),
    headline: z.string().nullable(),
    bio: z.string().nullable(),
    phone: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    disabilityType: z.string().nullable(),
    preferences: z.string().nullable(),
  }),
  specialties: z.string().nullable(),
  verified: z.boolean(),
  backgroundCheck: z.string().nullable(),
  rating: z.number(),
  yearsOnPlatform: z.number(),
  completedServices: z.number(),
  averageRating: z.number().nullable(),
  recentRatings: z.array(z.number()),
});

const bookingSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  companionId: z.string().nullable(),
  bookedById: z.string().nullable(),
  serviceId: z.string().nullable(),
  status: z.string(),
  serviceType: z.string(),
  summary: z.string().nullable(),
  address: z.string(),
  scheduledAt: z.string(),
  disability: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  client: z.object({
    id: z.string(),
    profile: z.object({ fullName: z.string() }).nullable().optional(),
  }).nullable().optional(),
  companion: z.object({
    profile: z.object({ fullName: z.string() }).nullable().optional(),
  }).nullable().optional(),
  service: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    price: z.number(),
    category: z.string().nullable().optional(),
    active: z.boolean().optional(),
  }).nullable().optional(),
  payment: z.object({
    id: z.string(),
    bookingId: z.string(),
    stripePaymentId: z.string().nullable(),
    amount: z.number(),
    fee: z.number(),
    currency: z.string(),
    status: z.string(),
  }).nullable().optional(),
  chatRoom: z.object({ id: z.string() }).nullable().optional(),
  report: z.object({ id: z.string() }).nullable().optional(),
});

const chatRoomSchema = z.object({
  room: z.object({ id: z.string() }),
  messages: z.array(z.object({
    id: z.string(),
    roomId: z.string(),
    senderId: z.string(),
    content: z.string(),
    createdAt: z.string(),
  })),
});

const reportSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  rating: z.number(),
  summary: z.string().nullable(),
});

const healthSchema = z.object({ status: z.string() });

export async function requestMagicLink(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to request magic link');
}

export async function syncUser(): Promise<{ id: string; email: string; role: string }> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/auth/me`, { headers });
  if (!response.ok) throw new Error('Failed to sync user');
  return response.json();
}

export async function getProfile(opts?: FetchOptions): Promise<UserProfile | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, { headers, signal: opts?.signal });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch profile');
  }
  const data = await response.json();
  return validateResponse(profileSchema, data, 'profile');
}

export async function upsertProfile(data: Record<string, unknown>): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  const json = await response.json();
  return validateResponse(profileSchema, json, 'upsertProfile');
}

export async function createBooking(data: {
  serviceType: string;
  address: string;
  scheduledAt: string;
  summary?: string;
  disability?: string;
  companionId?: string;
  serviceId?: string;
}): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create booking');
  }
  const json = await response.json();
  return validateResponse(bookingSchema, json, 'createBooking');
}

export async function requestBooking(bookingId: string): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${bookingId}/request`, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) throw new Error('Failed to request booking');
  const json = await response.json();
  return validateResponse(bookingSchema, json, 'requestBooking');
}

export async function getOpenBookings(): Promise<BookingData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/open`, { headers });
  if (!response.ok) throw new Error('Failed to fetch open bookings');
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: unknown) => validateResponse(bookingSchema, item, 'getOpenBookings'));
}

export async function getMyBookings(opts?: FetchOptions): Promise<BookingData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/me`, { headers, signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: unknown) => validateResponse(bookingSchema, item, 'getMyBookings'));
}

export async function getBooking(id: string, opts?: FetchOptions): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${id}`, { headers, signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch booking');
  const json = await response.json();
  return validateResponse(bookingSchema, json, 'getBooking');
}

export async function updateBookingStatus(
  id: string,
  status: string,
): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update booking status');
  }
  const json = await response.json();
  return validateResponse(bookingSchema, json, 'updateBookingStatus');
}

export async function requestCompletion(bookingId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${bookingId}/request-completion`, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to request completion');
  }
}

export async function completeByClient(bookingId: string): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to complete booking');
  }
  return response.json();
}

export async function getCompanions(opts?: FetchOptions): Promise<CompanionSummary[]> {
  const response = await fetch(`${API_URL}/profiles/companions`, { signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch companions');
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: unknown) => validateResponse(companionSummarySchema, item, 'getCompanions'));
}

export async function getCompanionById(id: string, opts?: FetchOptions): Promise<CompanionDetail> {
  const response = await fetch(`${API_URL}/profiles/companions/${id}`, { signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch companion');
  const json = await response.json();
  return validateResponse(companionDetailSchema, json, 'getCompanionById');
}

export async function getRecommendations(params: {
  search?: string;
  disabilityType?: string;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
} = {}, opts?: FetchOptions): Promise<PaginatedResponse<CompanionSummary>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.disabilityType) query.set('disabilityType', params.disabilityType);
  if (params.minRating !== undefined) query.set('minRating', String(params.minRating));
  if (params.verified !== undefined) query.set('verified', String(params.verified));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const response = await fetch(`${API_URL}/matching/recommendations?${query.toString()}`, { signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  const result = await response.json();
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((item: unknown) => validateResponse(companionSummarySchema, item, 'getRecommendations'));
  }
  return result as PaginatedResponse<CompanionSummary>;
}

export async function getChatRoom(bookingId: string, opts?: FetchOptions): Promise<ChatRoomData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/chat/room/${bookingId}`, { headers, signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch chat room');
  const json = await response.json();
  return validateResponse(chatRoomSchema, json, 'getChatRoom');
}

export async function sendChatMessage(bookingId: string, content: string): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/chat/room/${bookingId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function logout(): Promise<void> {
  const headers = await getAuthHeaders();
  const supabase = createClient();
  await supabase.auth.signOut();
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers,
  }).catch(() => {
    console.warn('Server logout failed, local signOut completed');
  });
}

export async function createReport(
  bookingId: string,
  data: { rating: number; summary?: string },
): Promise<ReportData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/reports/${bookingId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create report');
  }
  const json = await response.json();
  return validateResponse(reportSchema, json, 'createReport');
}

export async function getReportByBooking(bookingId: string, opts?: FetchOptions): Promise<ReportData | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/reports/booking/${bookingId}`, { headers, signal: opts?.signal });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch report');
  }
  const json = await response.json();
  return validateResponse(reportSchema, json, 'getReportByBooking');
}

export async function getHealth(opts?: FetchOptions): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`, { signal: opts?.signal });
  if (!response.ok) throw new Error('API error');
  const json = await response.json();
  return validateResponse(healthSchema, json, 'getHealth');
}

export async function createSupervision(clientId: string): Promise<SupervisionData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ clientId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create supervision');
  }
  return response.json();
}

export async function getMyClients(opts?: FetchOptions): Promise<SupervisionData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/clients`, { headers, signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
}

export async function getMySupervisor(opts?: FetchOptions): Promise<SupervisorData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/supervisor`, { headers, signal: opts?.signal });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch supervisor');
  }
  return response.json();
}

export async function removeSupervision(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to remove supervision');
  }
}

export async function searchUsers(query: string, opts?: FetchOptions): Promise<UserSearchResult[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}`, { headers, signal: opts?.signal });
  if (!response.ok) throw new Error('Failed to search users');
  return response.json();
}

export async function inviteSupervision(data: {
  clientName: string;
  clientEmail?: string;
  clientId?: string;
}): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/invite`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to invite');
  }
  return response.json();
}

export async function acceptInvitation(token: string): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/accept?token=${encodeURIComponent(token)}`, { headers });
  return response.json();
}

export async function getPendingInvites(): Promise<any[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/invites`, { headers });
  if (!response.ok) throw new Error('Failed to fetch pending invites');
  return response.json();
}

function adminHeaders(key: string): Record<string, string> {
  return { 'x-admin-key': key, 'Content-Type': 'application/json' };
}

export async function adminLogin(key: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: adminHeaders(key) });
  return res.ok;
}

export async function adminGetStats(key: string): Promise<AdminStats> {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return res.json();
}

export async function adminGetUsers(key: string): Promise<AdminUser[]> {
  const res = await fetch(`${API_URL}/admin/users`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function adminGetPending(key: string): Promise<AdminPending> {
  const res = await fetch(`${API_URL}/admin/pending`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener pendientes');
  return res.json();
}

export async function adminVerifyCompanion(key: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/companions/${id}/verify`, { method: 'PUT', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al verificar acompañante');
}

export async function adminRejectCompanion(key: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/companions/${id}/reject`, { method: 'PUT', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al rechazar acompañante');
}

export async function adminVerifyProfile(key: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/profiles/${id}/verify`, { method: 'PUT', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al verificar perfil');
}

export async function adminRejectProfile(key: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/profiles/${id}/reject`, { method: 'PUT', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al rechazar perfil');
}

// --- Admin Bookings ---

export async function adminGetBookings(key: string, page = 1, status?: string): Promise<PaginatedResponse<AdminBooking>> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
  const res = await fetch(`${API_URL}/admin/bookings?${params}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
}

export async function adminGetBooking(key: string, id: string): Promise<AdminBookingDetail> {
  const res = await fetch(`${API_URL}/admin/bookings/${id}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener reserva');
  return res.json();
}

export async function adminUpdateBookingStatus(key: string, id: string, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: adminHeaders(key),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
}

// --- Admin Services ---

export async function adminGetServices(key: string): Promise<ServiceData[]> {
  const res = await fetch(`${API_URL}/admin/services`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener servicios');
  return res.json();
}

export async function adminCreateService(key: string, data: { name: string; description?: string; price: number; category?: string }): Promise<ServiceData> {
  const res = await fetch(`${API_URL}/admin/services`, {
    method: 'POST',
    headers: adminHeaders(key),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear servicio');
  return res.json();
}

export async function adminUpdateService(key: string, id: string, data: { name?: string; description?: string; price?: number; category?: string }): Promise<ServiceData> {
  const res = await fetch(`${API_URL}/admin/services/${id}`, {
    method: 'PUT',
    headers: adminHeaders(key),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar servicio');
  return res.json();
}

export async function adminToggleService(key: string, id: string): Promise<ServiceData> {
  const res = await fetch(`${API_URL}/admin/services/${id}/toggle`, { method: 'PUT', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al alternar servicio');
  return res.json();
}

// --- Admin Payments ---

export async function adminGetPayments(key: string, page = 1): Promise<PaginatedResponse<AdminPayment>> {
  const res = await fetch(`${API_URL}/admin/payments?page=${page}&limit=20`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener pagos');
  return res.json();
}

// --- Admin Reports ---

export async function adminGetReports(key: string, page = 1): Promise<PaginatedResponse<AdminReport>> {
  const res = await fetch(`${API_URL}/admin/reports?page=${page}&limit=20`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al obtener valoraciones');
  return res.json();
}

export async function adminDeleteReport(key: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/reports/${id}`, { method: 'DELETE', headers: adminHeaders(key) });
  if (!res.ok) throw new Error('Error al eliminar valoración');
}

// --- Admin Notifications ---

export async function adminSendNotification(key: string, data: { title: string; body: string; role?: string }): Promise<{ sent: number }> {
  const res = await fetch(`${API_URL}/admin/notifications`, {
    method: 'POST',
    headers: adminHeaders(key),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al enviar notificación');
  return res.json();
}

export async function cancelInvitation(id: string): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/invite/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to cancel invitation');
  }
  return response.json();
}

export async function getSupervisorBookings(page = 1): Promise<PaginatedResponse<AdminBooking>> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/bookings?page=${page}&limit=20`, { headers });
  if (!response.ok) throw new Error('Failed to fetch client bookings');
  return response.json();
}

export async function getNotifications(): Promise<NotificationData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/notifications`, { headers });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

export async function getUnreadCount(): Promise<number> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/notifications/unread-count`, { headers });
  if (!response.ok) throw new Error('Failed to fetch unread count');
  const data = await response.json();
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers });
  if (!response.ok) throw new Error('Failed to mark notification read');
}

export async function markAllNotificationsRead(): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers });
  if (!response.ok) throw new Error('Failed to mark all read');
}

export async function getServices(): Promise<ServiceData[]> {
  const response = await fetch(`${API_URL}/services`);
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
}

export async function getCompanionAvailability(companionId: string): Promise<AvailabilitySlotData[]> {
  const response = await fetch(`${API_URL}/companions/${companionId}/availability`);
  if (!response.ok) throw new Error('Failed to fetch availability');
  return response.json();
}

export async function setMyAvailability(slots: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/availability`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ slots }),
  });
  if (!response.ok) throw new Error('Failed to set availability');
  return response.json();
}

export async function getBookingHistory(params?: { page?: number; limit?: number; status?: string }): Promise<BookingHistoryResponse> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  const response = await fetch(`${API_URL}/bookings/history${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function getBookingStats(): Promise<BookingStats> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/stats`, { headers });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}
