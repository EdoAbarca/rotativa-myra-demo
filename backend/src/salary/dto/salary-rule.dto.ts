import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeductionRuleDto {
  @IsString()
  absence_type: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  deduction_percentage: number;
}

export class CreateSalaryRuleDto {
  @IsString()
  rule_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  employee_category: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  overtime_multiplier: number;

  @IsNumber()
  @Min(1)
  @Max(24)
  standard_hours_per_day: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  working_days_per_month: number;

  @IsNumber()
  @Min(0)
  min_working_hours_per_month: number;

  @IsNumber()
  @Min(0)
  max_working_hours_per_month: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeductionRuleDto)
  deduction_rules?: DeductionRuleDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  default_deduction_percentage: number;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdateSalaryRuleDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  overtime_multiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  standard_hours_per_day?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  working_days_per_month?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_working_hours_per_month?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_working_hours_per_month?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeductionRuleDto)
  deduction_rules?: DeductionRuleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  default_deduction_percentage?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;

  @IsOptional()
  @IsString()
  change_reason?: string;
}

export class QuerySalaryRulesDto {
  @IsOptional()
  @IsString()
  employee_category?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
