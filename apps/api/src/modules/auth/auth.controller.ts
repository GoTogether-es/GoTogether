import { Controller, Get, Post, Body, UseGuards, Request, Headers, InternalServerErrorException } from '@nestjs/common';
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

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    if (!req.user?.userId || !req.user?.email) {
      console.error('[getMe] req.user inválido:', JSON.stringify(req.user));
      throw new InternalServerErrorException('Usuario no válido en la petición');
    }
    const user = await this.authService.validateAndSyncUser(req.user);
    if (!user) {
      console.error('[getMe] validateAndSyncUser devolvió null/undefined');
      throw new InternalServerErrorException('Error al sincronizar usuario');
    }
    return user;
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader || '');
  }
}
