// Validation schemas using Zod (messages via i18n `t`)
import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createClientSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('validation.nameRequired')).max(200, t('validation.nameMax')),
    email: z.string().email(t('validation.invalidEmail')).optional().or(z.literal('')),
    phone: z.string().optional(),
    company: z.string().max(200, t('validation.companyMax')).optional(),
    notes: z.string().optional(),
  });

export type ClientFormData = z.infer<ReturnType<typeof createClientSchema>>;

export const createProjectSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('validation.titleRequired')).max(255, t('validation.titleMax')),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    budget: z.number().min(0, t('validation.budgetPositive')),
    deadline: z.string().optional(),
    clientId: z.string().min(1, t('validation.clientRequired')),
  });

export type ProjectFormData = z.infer<ReturnType<typeof createProjectSchema>>;

export const createProposalSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('validation.titleRequired')).max(255, t('validation.titleMax')),
    amount: z.number().min(0, t('validation.amountPositive')),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
    notes: z.string().optional(),
    validUntil: z.string().optional(),
    projectId: z.string().min(1, t('validation.projectRequired')),
  });

export type ProposalFormData = z.infer<ReturnType<typeof createProposalSchema>>;

export const createInvoiceSchema = (t: TFunction) =>
  z.object({
    amount: z.number().min(0, t('validation.amountPositive')),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    projectId: z.string().min(1, t('validation.projectRequired')),
  });

export type InvoiceFormData = z.infer<ReturnType<typeof createInvoiceSchema>>;

export const createMarkInvoicePaidSchema = (t: TFunction) =>
  z.object({
    amount: z.number().min(0.01, t('validation.amountGtZero')),
    method: z.string().min(1, t('validation.paymentMethodRequired')),
    notes: z.string().optional(),
  });

export type MarkInvoicePaidFormData = z.infer<ReturnType<typeof createMarkInvoicePaidSchema>>;
