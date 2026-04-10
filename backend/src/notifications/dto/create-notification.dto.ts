import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(['info', 'success', 'warning', 'error', 'achievement', 'badge'])
  type?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;
}
