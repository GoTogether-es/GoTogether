import { Controller, Put, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('admin')
@UseGuards(SupabaseAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Put('companions/:id/verify')
  verifyCompanion(@Param('id') id: string) {
    return this.adminService.verifyCompanion(id);
  }
}
