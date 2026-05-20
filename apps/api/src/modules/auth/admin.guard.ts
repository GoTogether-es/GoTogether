import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminPasswordHash: string;

  constructor(private readonly configService: ConfigService) {
    this.adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH') || '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];

    if (!adminKey) {
      throw new UnauthorizedException('Clave de administrador requerida');
    }

    // Use bcrypt hash if configured, fallback to plaintext comparison
    if (this.adminPasswordHash) {
      const valid = await bcrypt.compare(adminKey, this.adminPasswordHash);
      if (!valid) {
        throw new UnauthorizedException('Clave de administrador incorrecta');
      }
    } else {
      const plainPassword = this.configService.get<string>('ADMIN_PASSWORD');
      if (!plainPassword || adminKey !== plainPassword) {
        throw new UnauthorizedException('Clave de administrador incorrecta');
      }
    }

    return true;
  }
}