import { IsString, IsOptional, IsBoolean, IsIn, MaxLength } from 'class-validator';

export class UpsertProfileDto {
  @IsString()
  @MaxLength(200)
  fullName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  headline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  disabilityType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  preferences?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  disabilityDescription?: string;

  @IsString()
  @IsOptional()
  disabilityDocument?: string;

  @IsBoolean()
  @IsOptional()
  isCompanion?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  specialties?: string;

  @IsString()
  @IsOptional()
  backgroundCheck?: string;

  @IsString()
  @IsOptional()
  sexualCheck?: string;

  @IsString()
  @IsOptional()
  penalCertificate?: string;

  @IsString()
  @IsOptional()
  sexualCertificate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CLIENT', 'COMPANION', 'SUPERVISOR'])
  role?: string;
}
