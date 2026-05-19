import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AvailabilityService, AvailabilitySlotDto } from './availability.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

class SetAvailabilityDto {
  slots!: AvailabilitySlotDto[];
}

@Controller()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('companions/:id/availability')
  getForCompanion(@Param('id') id: string) {
    return this.availabilityService.getForCompanion(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('availability')
  setMyAvailability(@Request() req: any, @Body() dto: SetAvailabilityDto) {
    return this.availabilityService.setForCompanion(req.user.userId, dto.slots);
  }
}
