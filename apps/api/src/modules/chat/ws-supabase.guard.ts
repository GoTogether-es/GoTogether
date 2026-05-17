import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../../generated/client';

@Injectable()
export class WsSupabaseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.auth?.token || client.handshake?.query?.token;

    if (!token) {
      throw new WsException('Token no proporcionado');
    }

    try {
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) throw new Error('SUPABASE_JWT_SECRET no configurado');

      const payload = jwt.verify(token, secret) as { sub: string; email: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.data.role = user?.role || UserRole.CLIENT;

      return true;
    } catch (err: any) {
      throw new WsException(err.message || 'Token inválido');
    }
  }
}
