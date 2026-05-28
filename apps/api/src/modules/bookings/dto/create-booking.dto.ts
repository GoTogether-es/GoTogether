import { IsString, IsOptional, IsDateString, IsInt, Min, Max, Matches, MaxLength, IsNumber } from 'class-validator';

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

  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  localDayOfWeek?: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsOptional()
  localTime?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedHours?: number;
}

