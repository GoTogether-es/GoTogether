import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getMagicLinkTemplate } from './mail.templates';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;
  private resend: Resend;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.supabaseAdmin = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendMagicLink(email: string) {
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
