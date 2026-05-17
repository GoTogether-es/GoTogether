import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PaymentsModule } from '../payments/payments.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PaymentsModule, ChatModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
