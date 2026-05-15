import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

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

export async function getProfile() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, { headers });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

export async function upsertProfile(data: any) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
}

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error('API error');
  }
  return response.json() as Promise<{ status: string }>;
}
