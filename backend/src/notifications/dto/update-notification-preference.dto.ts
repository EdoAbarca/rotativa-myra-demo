import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  email_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  in_app_enabled?: boolean;

  @IsEmail()
  @IsOptional()
  email_address?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notification_types?: string[];
}
