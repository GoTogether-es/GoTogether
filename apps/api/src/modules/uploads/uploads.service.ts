import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function extractSignedUrl(data: unknown): string | null {
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  const candidate = d.signedUrl ?? d.url ?? d.signed_url;
  if (typeof candidate === 'string') return candidate;
  if (candidate && typeof candidate === 'object') {
    const inner = (candidate as Record<string, unknown>).url;
    if (typeof inner === 'string') return inner;
  }
  return null;
}

@Injectable()
export class UploadsService {
  private supabaseAdmin: SupabaseClient;
  private supabaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL')!;
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabaseAdmin = createClient(this.supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async createPresignedUrl(key: string, contentType: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from('certificates')
      .createSignedUploadUrl(key);

    if (error) {
      throw new InternalServerErrorException(
        `Error al generar URL de subida: ${error.message}`,
      );
    }

    const signedUrl = extractSignedUrl(data);

    if (!signedUrl) {
      console.error('Supabase signed upload response:', JSON.stringify(data));
      throw new InternalServerErrorException(
        'No se pudo obtener URL de subida de Supabase',
      );
    }

    const fullUrl = signedUrl.startsWith('http')
      ? signedUrl
      : `${this.supabaseUrl}${signedUrl.startsWith('/') ? '' : '/'}${signedUrl}`;

    return { url: fullUrl };
  }
}
