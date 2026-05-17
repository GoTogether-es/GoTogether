import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsSupabaseGuard } from './ws-supabase.guard';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsSupabaseGuard)
  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const { messages } = await this.chatService.getMessages(payload.roomId, userId);
      client.join(payload.roomId);
      client.emit('history', { roomId: payload.roomId, messages });
      return { joined: payload.roomId };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'No se pudo unir a la sala' });
      return { error: err.message };
    }
  }

  @UseGuards(WsSupabaseGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!payload.content?.trim()) return;

    try {
      const message = await this.chatService.saveMessage(
        payload.roomId,
        userId,
        payload.content,
      );
      const eventPayload = {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      };
      this.server.to(payload.roomId).emit('message', eventPayload);
      return eventPayload;
    } catch (err: any) {
      client.emit('error', { message: err.message || 'No se pudo enviar el mensaje' });
      return { error: err.message };
    }
  }
}
