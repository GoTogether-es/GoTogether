import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './supabase.strategy';
import { RolesAuthGuard } from './roles-auth.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { MailService } from './mail.service';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, SupabaseJwtStrategy, RolesAuthGuard, SupabaseAuthGuard, MailService],
  controllers: [AuthController],
  exports: [AuthService, RolesAuthGuard, SupabaseAuthGuard, MailService],
})
export class AuthModule {}
