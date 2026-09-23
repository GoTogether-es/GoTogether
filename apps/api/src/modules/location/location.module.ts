import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GeocodingService } from './geocoding.service';
import { LocationController } from './location.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 1000, // 1 hora
      max: 500,
    }),
  ],
  controllers: [LocationController],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class LocationModule {}