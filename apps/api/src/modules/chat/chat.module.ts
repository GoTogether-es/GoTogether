import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WsSupabaseGuard } from './ws-supabase.guard';

@Module({
  providers: [ChatGateway, ChatService, WsSupabaseGuard],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
