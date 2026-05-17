import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './supabase.strategy';
import { RolesAuthGuard } from './roles-auth.guard';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, SupabaseJwtStrategy, RolesAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
