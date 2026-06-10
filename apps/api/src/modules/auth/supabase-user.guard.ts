import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SupabaseUserGuard implements CanActivate {
  private supabaseAdmin: SupabaseClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private getAdminClient(): SupabaseClient {
    if (this.supabaseAdmin) return this.supabaseAdmin;

    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new InternalServerErrorException('Auth configuration missing');
    }

    this.supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    return this.supabaseAdmin;
  }

  private extractUserId(token: string): { userId: string; email: string } | null {
    try {
      const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
      if (!jwtSecret) return null;

      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as any;
      if (decoded?.sub && decoded?.email) {
        return { userId: decoded.sub, email: decoded.email };
      }
      return null;
    } catch {
      return null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Fast path: verify JWT locally with HS256 + SUPABASE_JWT_SECRET
    const localUser = this.extractUserId(token);
    if (localUser) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: localUser.userId },
        select: { role: true },
      });

      request.user = {
        userId: localUser.userId,
        email: localUser.email,
        role: dbUser?.role ?? null,
      };

      return true;
    }

    // Fallback: verify via Supabase Admin API
    const { data: { user }, error } = await this.getAdminClient().auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    request.user = {
      userId: user.id,
      email: user.email,
      role: dbUser?.role ?? null,
    };

    return true;
  }
}
