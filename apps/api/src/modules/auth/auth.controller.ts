import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    // The user object is attached by the SupabaseJwtStrategy
    const user = await this.authService.validateAndSyncUser(req.user);
    return user;
  }
}
