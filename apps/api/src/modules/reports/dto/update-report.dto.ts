import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateReportDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  summary?: string;
}
