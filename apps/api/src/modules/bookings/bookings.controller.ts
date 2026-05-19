import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findByUser(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('open')
  findOpenBookings() {
    return this.bookingsService.findOpenBookings();
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('history')
  findHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.findHistory(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('stats')
  getStats(@Request() req: any) {
    return this.bookingsService.getStats(req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto, req.user.userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id/request')
  requestBooking(@Param('id') id: string) {
    return this.bookingsService.requestBooking(id);
  }
}
