import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @MaxLength(200)
  serviceType!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  disability?: string;

  @IsString()
  @IsOptional()
  companionId?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}
