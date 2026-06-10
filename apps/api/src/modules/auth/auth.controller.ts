import { Controller, Get, Post, Body, UseGuards, Request, Headers, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class MagicLinkDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  next?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  requestMagicLink(@Body() body: MagicLinkDto) {
    return this.authService.sendMagicLink(body.email, body.next);
  }

  @Get('me')
  async getMe(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = auth.split(' ')[1];
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    let userId: string | null = null;
    let email: string | null = null;

    // Intentar HS256 local
    if (jwtSecret) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as any;
        userId = decoded?.sub ?? null;
        email = decoded?.email ?? null;
        console.log('[getMe] HS256 OK sub:', userId, 'email:', email);
      } catch (e: any) {
        console.log('[getMe] HS256 falló:', e.message);
      }
    }

    // Fallback getUser
    if (!userId || !email) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        try {
          const { createClient } = require('@supabase/supabase-js');
          const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
          const { data, error } = await admin.auth.getUser(token);
          if (!error && data?.user) {
            userId = data.user.id;
            email = data.user.email;
            console.log('[getMe] getUser OK sub:', userId);
          } else {
            console.error('[getMe] getUser falló:', error?.message);
          }
        } catch (e: any) {
          console.error('[getMe] getUser exception:', e.message);
        }
      }
    }

    if (!userId || !email) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      const user = await this.authService.validateAndSyncUser({ userId, email });
      console.log('[getMe] success userId:', user?.id);
      return user ?? { id: userId, email, role: null };
    } catch (e: any) {
      console.error('[getMe] validateAndSyncUser error:', e.message);
      return { id: userId, email, role: null };
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader || '');
  }
}
