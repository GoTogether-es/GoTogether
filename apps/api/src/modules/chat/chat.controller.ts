import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
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

  @UseGuards(SupabaseAuthGuard)
  @Post('room/:bookingId/messages')
  @HttpCode(201)
  async sendMessage(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() body: { content: string },
  ) {
    const room = await this.chatService.getOrCreateRoom(bookingId, req.user.userId);
    return this.chatService.saveMessage(room.id, req.user.userId, body.content);
  }
}