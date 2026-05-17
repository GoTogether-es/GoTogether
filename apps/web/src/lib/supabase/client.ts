import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE CLIENT ERROR: Missing environment variables. Using placeholders for build stability.');
  }

  clientInstance = createBrowserClient(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseKey ?? 'sbp_placeholder'
  );

  return clientInstance;
}
