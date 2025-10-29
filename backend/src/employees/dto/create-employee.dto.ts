import {
  IsString,
  IsEmail,
  IsNumber,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsNumber()
  @Min(0)
  base_salary: number;

  @IsDateString()
  @IsNotEmpty()
  hire_date: string;

  @IsEnum(['active', 'inactive', 'on_leave'])
  @IsNotEmpty()
  status: string;
}
