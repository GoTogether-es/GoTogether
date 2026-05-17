import { IsEnum } from 'class-validator';
import { BookingStatus } from '../../../generated/client';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
