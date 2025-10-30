import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsString()
  employee_id: string;

  @IsNotEmpty()
  @IsEnum(['Vacation', 'Sick', 'Personal'])
  leave_type: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsNotEmpty()
  @IsEnum(['Pending', 'Approved', 'Rejected'])
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
