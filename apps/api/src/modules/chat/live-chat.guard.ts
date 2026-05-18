import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveChatGuard implements CanActivate {
  private supabaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      const user = await this.validateToken(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);

    const queryToken = request.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) return queryToken;

    return null;
  }

  private async validateToken(token: string): Promise<{ userId: string; email: string }> {
    const res = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Invalid token');
    const user = await res.json();
    return { userId: user.id, email: user.email };
  }
}