import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';

export class QueryLeavesDto {
  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsEnum(['Vacation', 'Sick', 'Personal'])
  leave_type?: string;

  @IsOptional()
  @IsEnum(['Pending', 'Approved', 'Rejected'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(['start_date', 'end_date', 'leave_type', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}
