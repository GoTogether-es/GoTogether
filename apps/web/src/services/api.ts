import { env } from '@/lib/env';

const API_URL = env.apiUrl;

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error('API error');
  }
  return response.json() as Promise<{ status: string }>;
}
