import { IsOptional, IsEnum, IsDateString } from 'class-validator';

export class QueryAbsenceAlertsDto {
  @IsOptional()
  @IsEnum(['unexcused', 'excused', 'pending_review'])
  status?: string;

  @IsOptional()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
