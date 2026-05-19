import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  listActive() {
    return this.servicesService.listActive();
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('all')
  listAll() {
    return this.servicesService.listAll();
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Body() body: { name: string; description?: string; price?: number; category?: string }) {
    return this.servicesService.create(body);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string; price?: number; category?: string; active?: boolean }) {
    return this.servicesService.update(id, body);
  }
}
