import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string | Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
