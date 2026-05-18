import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { LiveChatGuard } from './live-chat.guard';

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
  sendMessage(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() body: { content: string },
  ) {
    return this.chatService.sendMessage(bookingId, req.user.userId, body.content);
  }

  @UseGuards(LiveChatGuard)
  @Get('room/:bookingId/live')
  async liveMessages(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Res() res: Response,
  ) {
    const room = await this.chatService.getOrCreateRoom(bookingId, req.user.userId);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(':ok\n\n');

    const cleanup = this.chatService.onMessage(room.id, (message) => {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    });

    req.on('close', () => {
      cleanup();
      res.end();
    });
  }
}