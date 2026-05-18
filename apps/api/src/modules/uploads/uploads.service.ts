import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

    const raw = data as Record<string, unknown>;
    const signedUrl: string | undefined =
      (raw?.signedUrl as string) ??
      (raw?.signed_url as string) ??
      (raw?.url as string) ??
      (typeof data === 'string' ? data : undefined);

    if (!signedUrl) {
      throw new InternalServerErrorException(
        'No se recibió URL de subida de Supabase',
      );
    }

    const fullUrl = signedUrl.startsWith('http')
      ? signedUrl
      : `${this.supabaseUrl}${signedUrl}`;

    return { url: fullUrl };
  }
}
