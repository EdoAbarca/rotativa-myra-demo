import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  employee_id: string;

  @IsDateString()
  date: string;

  @IsEnum(['Present', 'Absent', 'Late'])
  status: string;

  @IsOptional()
  @IsString()
  check_in_time?: string;

  @IsOptional()
  @IsString()
  check_out_time?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hours_worked?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtime_hours?: number;
}
