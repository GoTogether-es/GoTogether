import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  list(@Request() req: any) {
    return this.reportsService.listByUser(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('booking/:bookingId')
  getByBooking(@Request() req: any, @Param('bookingId') bookingId: string) {
    return this.reportsService.getByBooking(bookingId, req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':bookingId')
  create(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(bookingId, req.user.userId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, req.user.userId, dto);
  }
}
