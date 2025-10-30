import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  base_salary?: number;

  @IsEnum(['active', 'inactive', 'on_leave'])
  @IsOptional()
  status?: string;
}
