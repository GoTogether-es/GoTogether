import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.profilesService.getProfileByUserId(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('me')
  upsertMe(@Request() req: any, @Body() dto: UpsertProfileDto) {
    return this.profilesService.upsertProfile(req.user.userId, dto);
  }

  @Get('companions')
  listCompanions() {
    return this.profilesService.listCompanions();
  }
}
