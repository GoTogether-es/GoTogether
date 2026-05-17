import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('room/:bookingId')
  getRoom(@Request() req: any, @Param('bookingId') bookingId: string) {
    return this.chatService.getOrCreateRoom(bookingId, req.user.userId).then((room) =>
      this.chatService.getMessages(room.id, req.user.userId),
    );
  }
}
