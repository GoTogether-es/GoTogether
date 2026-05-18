import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminPassword: string;

  constructor(private readonly configService: ConfigService) {
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD')!;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];

    if (!adminKey || adminKey !== this.adminPassword) {
      throw new UnauthorizedException('Clave de administrador incorrecta');
    }

    return true;
  }
}