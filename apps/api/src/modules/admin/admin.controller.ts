import { Controller, Get, Put, Param, UseGuards, Headers } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('pending')
  listPending() {
    return this.adminService.listPending();
  }

  @Put('companions/:id/verify')
  verifyCompanion(@Param('id') id: string) {
    return this.adminService.verifyCompanion(id);
  }

  @Put('companions/:id/reject')
  rejectCompanion(@Param('id') id: string) {
    return this.adminService.rejectCompanion(id);
  }

  @Put('profiles/:id/verify')
  verifyProfile(@Param('id') id: string) {
    return this.adminService.verifyProfile(id);
  }

  @Put('profiles/:id/reject')
  rejectProfile(@Param('id') id: string) {
    return this.adminService.rejectProfile(id);
  }
}