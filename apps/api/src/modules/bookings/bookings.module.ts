import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ChatModule, NotificationsModule, AuthModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}