import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';

export class QueryAbsenceAlertsDto {
  @IsOptional()
  @IsEnum(['unexcused', 'excused', 'pending_review'])
  status?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
