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
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  disabilityType?: string;

  @IsString()
  @IsOptional()
  preferences?: string;

  @IsString()
  @IsOptional()
  disabilityDescription?: string;

  @IsString()
  @IsOptional()
  disabilityDocument?: string;

  @IsBoolean()
  @IsOptional()
  isCompanion?: boolean;

  @IsString()
  @IsOptional()
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
}
