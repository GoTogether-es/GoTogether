import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}