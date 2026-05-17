import { IsString } from 'class-validator';

export class CreateSupervisionDto {
  @IsString()
  clientId!: string;
}
