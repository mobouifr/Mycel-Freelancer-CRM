// =============================================================================
// CREATE PAYMENT DTO — Validated Input
// =============================================================================
// SECURITY FIX: Amount is accepted as a string to avoid floating-point
// precision loss.  The regex enforces exactly 2 decimal places.
// In a controller you'd use:  @Body(new ValidationPipe()) dto: CreatePaymentDto
// =============================================================================

import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    invoiceId: string;

    /**
     * Amount as a string with exactly 2 decimal places.
     * Examples: "10.23", "1500.00", "0.50"
     * Prevents floating-point precision issues (e.g. 10.23 → 10.229999…)
     */
    @IsString()
    @Matches(/^\d+\.\d{2}$/, {
        message: 'amount must be a numeric string with exactly 2 decimal places (e.g. "10.23")',
    })
    amount: string;

    @IsString()
    @IsNotEmpty()
    method: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
