import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class InviteSupervisionDto {
  @IsString()
  @MaxLength(200)
  clientName!: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}
