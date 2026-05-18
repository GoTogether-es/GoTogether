import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadsService {
  private supabaseAdmin: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL')!;
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async createPresignedUrl(key: string, contentType: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from('certificates')
      .createSignedUploadUrl(key);

    if (error) {
      throw new Error(`Error al generar URL de subida: ${error.message}`);
    }

    return { url: data.signedUrl, key, token: data.token };
  }
}
