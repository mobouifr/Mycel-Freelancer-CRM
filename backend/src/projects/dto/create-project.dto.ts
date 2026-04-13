import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'])
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsIn(['HIGH', 'MEDIUM', 'LOW'])
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
