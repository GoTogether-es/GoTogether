import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchingModule } from '../matching/matching.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { ChatModule } from '../chat/chat.module';
import { ReportsModule } from '../reports/reports.module';
import { LocationModule } from '../location/location.module';

import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServicesModule } from '../services/services.module';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    MatchingModule,
    BookingsModule,
    PaymentsModule,
    ChatModule,
    ReportsModule,
    LocationModule,

    AdminModule,
    NotificationsModule,
    ServicesModule,
    AvailabilityModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
