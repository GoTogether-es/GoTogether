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
    const tokenPreview = token.substring(0, 20) + '...';

    // Decode header
    let algo = 'unknown';
    try {
      const hdr = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
      algo = hdr.alg || 'unknown';
    } catch {}

    console.log('[getMe] token algo:', algo, 'preview:', tokenPreview);

    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    let userId: string | null = null;
    let email: string | null = null;
    let step = '';

    if (jwtSecret) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as any;
        userId = decoded?.sub ?? null;
        email = decoded?.email ?? null;
        step = 'HS256 OK';
      } catch (e: any) {
        step = 'HS256 FAIL: ' + (e?.message || String(e));
      }
    } else {
      step = 'No JWT secret configured';
    }

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
            step += ' | getUser OK';
          } else {
            step += ' | getUser FAIL: ' + (error?.message || String(error));
          }
        } catch (e: any) {
          step += ' | getUser EXCEPTION: ' + (e?.message || String(e));
        }
      } else {
        step += ' | No supabase config';
      }
    }

    console.log('[getMe] result:', step, 'userId:', userId);

    if (!userId || !email) {
      throw new UnauthorizedException(step + ' | tokenPreview= ' + tokenPreview);
    }

    try {
      const user = await this.authService.validateAndSyncUser({ userId, email });
      return user ?? { id: userId, email, role: null };
    } catch (e: any) {
      return { id: userId, email, role: null };
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader || '');
  }
}
