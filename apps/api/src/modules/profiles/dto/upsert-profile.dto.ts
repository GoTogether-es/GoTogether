import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpsertProfileDto {
  @IsString()
  fullName!: string;

  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  disabilityType?: string;

  @IsString()
  @IsOptional()
  preferences?: string;

  @IsBoolean()
  @IsOptional()
  isCompanion?: boolean;

  @IsString()
  @IsOptional()
  specialties?: string;
}
