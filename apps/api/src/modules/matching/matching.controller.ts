import { Controller, Get, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('recommendations')
  recommend(
    @Query('search') search?: string,
    @Query('disabilityType') disabilityType?: string,
    @Query('minRating') minRating?: string,
    @Query('verified') verified?: string,
    @Query('city') city?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.recommendCompanions({
      search,
      disabilityType,
      minRating: minRating ? Number(minRating) : undefined,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      city,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
