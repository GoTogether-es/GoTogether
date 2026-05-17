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
import { BookingsService } from './bookings.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UserRole } from '../../generated/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
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

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Put(':id/request')
  requestBooking(@Param('id') id: string) {
    return this.bookingsService.requestBooking(id);
  }
}
