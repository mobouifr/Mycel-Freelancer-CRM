import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ProposalStatus } from '@prisma/client';

export class CreateProposalDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;

  @IsDateString()
  @IsOptional()
  validUntil?: string | Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
