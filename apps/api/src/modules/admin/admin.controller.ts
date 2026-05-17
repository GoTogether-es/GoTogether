import 'reflect-metadata';

import { Controller, Put, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesAuthGuard, Roles } from '../auth/roles-auth.guard';
import { UserRole } from '../../generated/client';

@Controller('admin')
@UseGuards(RolesAuthGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Put('companions/:id/verify')
  verifyCompanion(@Param('id') id: string) {
    return this.adminService.verifyCompanion(id);
  }
}
