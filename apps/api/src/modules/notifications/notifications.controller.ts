import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findByUser(@Request() req: any) {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('unread-count')
  countUnread(@Request() req: any) {
    return this.notificationsService.countUnread(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markRead(id, req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('read-all')
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.userId);
  }
}