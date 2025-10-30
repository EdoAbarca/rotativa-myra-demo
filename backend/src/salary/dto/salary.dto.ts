import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CalculateSalaryDto {
  @IsString()
  employee_id: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class QuerySalaryDto {
  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
