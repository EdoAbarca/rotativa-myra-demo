import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdateHolidayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  recurring_month?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  recurring_day?: number;
}
