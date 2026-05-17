import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  summary?: string;
}
