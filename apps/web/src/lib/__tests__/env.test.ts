describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses defaults when env vars are not set', () => {
    delete (process.env as any).NEXT_PUBLIC_APP_URL;
    delete (process.env as any).NEXT_PUBLIC_API_URL;
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_URL;

    const { env } = require('@/lib/env');
    expect(env.appUrl).toBe('http://localhost:3000');
    expect(env.apiUrl).toBe('http://localhost:4000');
    expect(env.supabaseUrl).toBe('');
  });

  it('uses provided env vars', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';

    const { env } = require('@/lib/env');
    expect(env.appUrl).toBe('https://app.example.com');
    expect(env.apiUrl).toBe('https://api.example.com');
    expect(env.supabaseUrl).toBe('https://supabase.example.com');
  });
});
