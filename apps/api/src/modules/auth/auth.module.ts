import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseUserGuard } from './supabase-user.guard';
import { RolesAuthGuard } from './roles-auth.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { MailService } from './mail.service';

import { AdminGuard } from './admin.guard';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, SupabaseUserGuard, RolesAuthGuard, SupabaseAuthGuard, AdminGuard, MailService],
  controllers: [AuthController],
  exports: [AuthService, SupabaseUserGuard, RolesAuthGuard, SupabaseAuthGuard, AdminGuard, MailService],
})
export class AuthModule {}
