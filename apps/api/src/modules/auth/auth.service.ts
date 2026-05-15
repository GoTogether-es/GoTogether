import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getMagicLinkTemplate } from './mail.templates';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient | null = null;
  private resend: Resend | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (supabaseUrl && serviceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendMagicLink(email: string) {
    if (!this.supabaseAdmin || !this.resend) {
      const missing = [];
      if (!this.configService.get('SUPABASE_SERVICE_ROLE_KEY')) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      if (!this.configService.get('RESEND_API_KEY')) missing.push('RESEND_API_KEY');
      
      console.error('Missing configuration:', missing.join(', '));
      throw new InternalServerErrorException(`Error de configuración en el servidor: faltan variables (${missing.join(', ')})`);
    }
    try {
      // 1. Generar el enlace de autenticación usando Supabase Admin
      const { data, error } = await this.supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${this.configService.get<string>('NEXT_PUBLIC_APP_URL')}/auth/callback`,
        },
      });

      if (error) throw error;

      // 2. Enviar el correo usando Resend con nuestra plantilla profesional
      const { error: mailError } = await this.resend.emails.send({
        from: this.configService.get<string>('RESEND_FROM')!,
        to: [email],
        subject: 'Tu enlace de acceso a GoTogether',
        html: getMagicLinkTemplate(data.properties.action_link),
      });

      if (mailError) throw mailError;

      return { success: true, message: 'Correo enviado con éxito' };
    } catch (error) {
      console.error('Error in sendMagicLink:', error);
      throw new InternalServerErrorException('No se pudo enviar el enlace de acceso');
    }
  }

  async validateAndSyncUser(supabaseUser: { userId: string; email: string }) {
    return this.prisma.user.upsert({
      where: { id: supabaseUser.userId },
      update: { email: supabaseUser.email },
      create: {
        id: supabaseUser.userId,
        email: supabaseUser.email,
      },
    });
  }
}
