import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';
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
} from '@/types';

const API_URL = env.apiUrl;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return {};

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function requestMagicLink(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to request magic link');
}

export async function getProfile(): Promise<UserProfile | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, { headers });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

export async function upsertProfile(data: Record<string, unknown>): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export async function createBooking(data: {
  serviceType: string;
  address: string;
  scheduledAt: string;
  summary?: string;
  disability?: string;
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
  return response.json();
}

export async function requestBooking(bookingId: string): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${bookingId}/request`, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) throw new Error('Failed to request booking');
  return response.json();
}

export async function getMyBookings(): Promise<BookingData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/me`, { headers });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
}

export async function getBooking(id: string): Promise<BookingData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/bookings/${id}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch booking');
  return response.json();
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
  return response.json();
}

export async function getCompanions(): Promise<CompanionSummary[]> {
  const response = await fetch(`${API_URL}/profiles/companions`);
  if (!response.ok) throw new Error('Failed to fetch companions');
  return response.json();
}

export async function getCompanionById(id: string): Promise<CompanionDetail> {
  const response = await fetch(`${API_URL}/profiles/companions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch companion');
  return response.json();
}

export async function getRecommendations(params: {
  search?: string;
  disabilityType?: string;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<CompanionSummary>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.disabilityType) query.set('disabilityType', params.disabilityType);
  if (params.minRating !== undefined) query.set('minRating', String(params.minRating));
  if (params.verified !== undefined) query.set('verified', String(params.verified));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const response = await fetch(`${API_URL}/matching/recommendations?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
}

export async function getChatRoom(bookingId: string): Promise<ChatRoomData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/chat/room/${bookingId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch chat room');
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
  return response.json();
}

export async function getReportByBooking(bookingId: string): Promise<ReportData | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/reports/booking/${bookingId}`, { headers });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch report');
  }
  return response.json();
}

export async function getHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error('API error');
  return response.json();
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

export async function getMyClients(): Promise<SupervisionData[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/clients`, { headers });
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
}

export async function getMySupervisor(): Promise<SupervisorData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/supervision/supervisor`, { headers });
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

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}`, { headers });
  if (!response.ok) throw new Error('Failed to search users');
  return response.json();
}
