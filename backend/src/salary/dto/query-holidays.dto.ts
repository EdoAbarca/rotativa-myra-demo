import { IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class QueryHolidaysDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;
}
