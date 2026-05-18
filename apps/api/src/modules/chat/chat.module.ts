import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { LiveChatGuard } from './live-chat.guard';

@Module({
  imports: [ConfigModule],
  providers: [ChatService, LiveChatGuard],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}