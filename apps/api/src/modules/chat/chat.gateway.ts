import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() payload: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.roomId).emit('message', payload);
    return payload;
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.roomId);
    return { joined: payload.roomId };
  }
}
