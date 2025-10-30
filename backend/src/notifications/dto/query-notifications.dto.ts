import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';

export class QueryNotificationsDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'error', 'success'])
  severity?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  skip?: number;
}
