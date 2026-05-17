import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateSupervisionDto } from './dto/create-supervision.dto';

@Controller('supervision')
export class SupervisionController {
  constructor(private readonly supervisionService: SupervisionService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateSupervisionDto) {
    return this.supervisionService.createSupervision(req.user.userId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('clients')
  getMyClients(@Request() req: any) {
    return this.supervisionService.getMyClients(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('supervisor')
  getMySupervisor(@Request() req: any) {
    return this.supervisionService.getMySupervisor(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.supervisionService.removeSupervision(id, req.user.userId);
  }
}
