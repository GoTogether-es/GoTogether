import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  serviceType!: string;

  @IsString()
  address!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  disability?: string;

  @IsString()
  @IsOptional()
  companionId?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}
