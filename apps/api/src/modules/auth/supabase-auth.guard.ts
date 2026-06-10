import { Injectable } from '@nestjs/common';
import { SupabaseUserGuard } from './supabase-user.guard';

@Injectable()
export class SupabaseAuthGuard extends SupabaseUserGuard {}
