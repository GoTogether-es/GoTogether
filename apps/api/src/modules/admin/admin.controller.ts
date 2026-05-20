import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
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

  // --- Verification ---

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

  // --- Bookings ---

  @Get('bookings')
  listBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listBookings(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get('bookings/:id')
  getBooking(@Param('id') id: string) {
    return this.adminService.getBooking(id);
  }

  @Put('bookings/:id/status')
  updateBookingStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateBookingStatus(id, status as any);
  }

  // --- Services ---

  @Get('services')
  listServices() {
    return this.adminService.listServices();
  }

  @Post('services')
  createService(@Body() body: { name: string; description?: string; price: number; category?: string }) {
    return this.adminService.createService(body);
  }

  @Put('services/:id')
  updateService(@Param('id') id: string, @Body() body: { name?: string; description?: string; price?: number; category?: string }) {
    return this.adminService.updateService(id, body);
  }

  @Put('services/:id/toggle')
  toggleService(@Param('id') id: string) {
    return this.adminService.toggleService(id);
  }

  // --- Payments ---

  @Get('payments')
  listPayments(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listPayments(Number(page) || 1, Number(limit) || 20);
  }

  // --- Reports ---

  @Get('reports')
  listReports(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listReports(Number(page) || 1, Number(limit) || 20);
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.adminService.deleteReport(id);
  }

  // --- Notifications ---

  @Post('notifications')
  sendMassNotification(@Body() body: { title: string; body: string; role?: string }) {
    return this.adminService.sendMassNotification(body);
  }
}