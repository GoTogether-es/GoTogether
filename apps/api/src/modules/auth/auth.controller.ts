import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { IsEmail } from 'class-validator';

class MagicLinkDto {
  @IsEmail()
  email!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  requestMagicLink(@Body() body: MagicLinkDto) {
    return this.authService.sendMagicLink(body.email);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.authService.validateAndSyncUser(req.user);
    return user;
  }
}
