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
  async getMe(@Request() req: any, @Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = auth.split(' ')[1];

    // Intentar HS256 local
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    let payload: any = null;
    if (jwtSecret) {
      try {
        const jwt = require('jsonwebtoken');
        payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        console.log('[getMe] HS256 OK sub:', payload?.sub, 'email:', payload?.email);
      } catch (e: any) {
        console.log('[getMe] HS256 falló:', e?.message);
      }
    }

    // Fallback getUser
    if (!payload) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        const { createClient } = require('@supabase/supabase-js');
        const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data, error } = await admin.auth.getUser(token);
        if (error) {
          console.error('[getMe] getUser falló:', error.message);
          throw new UnauthorizedException(error.message);
        }
        if (!data?.user) {
          throw new UnauthorizedException('User not found');
        }
        payload = { sub: data.user.id, email: data.user.email };
        console.log('[getMe] getUser OK sub:', payload.sub);
      } else {
        throw new InternalServerErrorException('Auth config missing');
      }
    }

    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.authService.validateAndSyncUser({
      userId: payload.sub,
      email: payload.email,
    });

    if (!user) {
      console.error('[getMe] validateAndSyncUser devolvió null');
      throw new InternalServerErrorException('Error al sincronizar usuario');
    }

    console.log('[getMe] success userId:', user.id);
    return user;
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader || '');
  }
}
