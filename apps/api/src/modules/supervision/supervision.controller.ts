import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesAuthGuard, Roles } from '../auth/roles-auth.guard';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { InviteSupervisionDto } from './dto/invite-supervision.dto';
import { UserRole } from '../../generated/client';

@Controller('supervision')
export class SupervisionController {
  constructor(private readonly supervisionService: SupervisionService) {}

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Post()
  create(@Request() req: any, @Body() dto: CreateSupervisionDto) {
    return this.supervisionService.createSupervision(req.user.userId, dto);
  }

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Post('invite')
  invite(@Request() req: any, @Body() dto: InviteSupervisionDto) {
    return this.supervisionService.inviteSupervision(req.user.userId, dto);
  }

  @Get('accept')
  @HttpCode(200)
  async accept(@Query('token') token: string, @Request() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      return { needsAuth: true };
    }
    return this.supervisionService.acceptInvitation(token, userId);
  }

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Get('invites')
  getInvites(@Request() req: any) {
    return this.supervisionService.getPendingInvites(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Delete('invite/:id')
  cancelInvite(@Request() req: any, @Param('id') id: string) {
    return this.supervisionService.cancelInvitation(id, req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Get('clients')
  getMyClients(@Request() req: any) {
    return this.supervisionService.getMyClients(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('supervisor')
  getMySupervisor(@Request() req: any) {
    return this.supervisionService.getMySupervisor(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard, RolesAuthGuard)
  @Roles(UserRole.SUPERVISOR)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.supervisionService.removeSupervision(id, req.user.userId);
  }
}
