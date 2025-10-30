import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateAbsenceAlertDto {
  @IsEnum(['unexcused', 'excused', 'pending_review'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  reviewed_by?: string;

  @IsDateString()
  @IsOptional()
  reviewed_at?: string;
}
