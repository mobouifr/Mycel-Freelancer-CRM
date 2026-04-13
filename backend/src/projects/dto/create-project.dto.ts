import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

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

  // Frontend Zod schema ensures budget is always sent as a JS number.
  @IsOptional()
  @IsNumber()
  @Min(0)
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
