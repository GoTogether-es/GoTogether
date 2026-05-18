import { IsString, IsOptional, IsEmail } from 'class-validator';

export class InviteSupervisionDto {
  @IsString()
  clientName!: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}
