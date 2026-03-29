// =============================================================================
// PAYMENTS SERVICE — Prisma Transaction with Row Locking
// =============================================================================
//
// NOTE ON CONCURRENCY:
// For a low-concurrency freelancer CRM, a simple prisma.$transaction
// without row locking is acceptable if there's only one user at a time.
// However, this implementation uses SELECT FOR UPDATE to make it
// production-safe against concurrent payment submissions, preventing
// overpayment via row-level locking in PostgreSQL.
//
// =============================================================================

import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment, InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------
export interface CreatePaymentDto {
    invoiceId: string;
    /** SECURITY FIX: amount is a string to avoid floating-point precision loss.
     *  Must match /^\d+\.\d{2}$/ (e.g. "10.23"). */
    amount: string;
    method: string;
    notes?: string;
}

// Raw query result type for the locked invoice row
interface LockedInvoiceRow {
    id: string;
    amount: Decimal;
    status: InvoiceStatus;
    user_id: string;
    project_id: string;
}

export interface PaymentWithInvoice extends Payment {
    invoice: {
        id: string;
        amount: Decimal;
        status: InvoiceStatus;
    };
}

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // CREATE PAYMENT — Atomic Transaction with Row Lock
    // =========================================================================
    //
    // Why SELECT FOR UPDATE?
    // ─────────────────────
    // Without it, two concurrent transactions can both read the invoice,
    // both see enough remaining balance, and both insert a payment —
    // causing overpayment. SELECT FOR UPDATE acquires an exclusive row
    // lock: the second transaction blocks until the first commits or
    // rolls back, then sees the updated data.
    //
    // Flow:
    //   1. SELECT FOR UPDATE  → lock the invoice row
    //   2. Validate            → exists, not cancelled/paid
    //   3. SUM existing payments via aggregate
    //   4. Check remaining balance
    //   5. INSERT payment
    //   6. UPDATE invoice status (PENDING → PAID if fully paid)
    //
    // =========================================================================
    async createPayment(dto: CreatePaymentDto): Promise<PaymentWithInvoice> {
        const { invoiceId, amount: amountStr, method, notes } = dto;

        // SECURITY FIX: Validate the string format before converting to Decimal
        // to prevent floating-point precision loss (e.g. 10.23 → 10.229999…)
        if (!/^\d+\.\d{2}$/.test(amountStr)) {
            throw new BadRequestException(
                'Amount must be a string with exactly 2 decimal places (e.g. "10.23")',
            );
        }

        const amount = new Decimal(amountStr);

        return this.prisma.$transaction(async (tx) => {
            // ---------------------------------------------------------------
            // Step 1: Lock the invoice row with SELECT FOR UPDATE
            // This prevents any other transaction from reading or modifying
            // this invoice until we commit.
            // ---------------------------------------------------------------
            const lockedRows = await tx.$queryRaw<LockedInvoiceRow[]>`
        SELECT id, amount, status, user_id, project_id
        FROM invoices
        WHERE id = ${invoiceId}
        FOR UPDATE
      `;

            if (lockedRows.length === 0) {
                throw new NotFoundException(`Invoice ${invoiceId} not found`);
            }

            const invoice = lockedRows[0];

            // ---------------------------------------------------------------
            // Step 2: Validate the invoice is payable
            // ---------------------------------------------------------------
            if (invoice.status === InvoiceStatus.CANCELLED) {
                throw new BadRequestException(
                    `Invoice ${invoiceId} is cancelled and cannot accept payments`,
                );
            }

            if (invoice.status === InvoiceStatus.PAID) {
                throw new BadRequestException(
                    `Invoice ${invoiceId} is already fully paid`,
                );
            }

            // ---------------------------------------------------------------
            // Step 3: Validate payment amount
            // ---------------------------------------------------------------
            if (amount.lessThanOrEqualTo(0)) {
                throw new BadRequestException(
                    'Payment amount must be greater than 0',
                );
            }

            // ---------------------------------------------------------------
            // Step 4: Calculate remaining balance using aggregate
            // (also locked because the invoice row is locked)
            // ---------------------------------------------------------------
            const { _sum } = await tx.payment.aggregate({
                where: { invoiceId },
                _sum: { amount: true },
            });

            const invoiceAmount = new Decimal(invoice.amount.toString());
            const totalPaid = _sum.amount
                ? new Decimal(_sum.amount.toString())
                : new Decimal(0);
            const remaining = invoiceAmount.minus(totalPaid);

            if (amount.greaterThan(remaining)) {
                throw new BadRequestException(
                    `Payment amount ($${amount.toFixed(2)}) exceeds remaining balance ($${remaining.toFixed(2)})`,
                );
            }

            // ---------------------------------------------------------------
            // Step 5: Create the payment record
            // ---------------------------------------------------------------
            const payment = await tx.payment.create({
                data: {
                    amount: amount.toNumber(),
                    method,
                    notes,
                    invoiceId,
                },
            });

            // ---------------------------------------------------------------
            // Step 6: Update invoice status
            // ---------------------------------------------------------------
            const newTotal = totalPaid.plus(amount);
            const fullyPaid = newTotal.greaterThanOrEqualTo(invoiceAmount);

            const updatedInvoice = await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: fullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
                },
            });

            return {
                ...payment,
                invoice: {
                    id: updatedInvoice.id,
                    amount: updatedInvoice.amount,
                    status: updatedInvoice.status,
                },
            };
        });
    }

    // =========================================================================
    // GET PAYMENTS BY INVOICE
    // =========================================================================
    async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { paidAt: 'desc' },
        });
    }

    // =========================================================================
    // GET PAYMENT BY ID
    // =========================================================================
    async getPaymentById(id: string): Promise<PaymentWithInvoice | null> {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                invoice: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                    },
                },
            },
        });
    }
}
