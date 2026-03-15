// Validation schemas using Zod
import { z } from 'zod';

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().max(200, 'Company name must be less than 200 characters').optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Project validation
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  deadline: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Proposal validation
export const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  amount: z.number().min(0, 'Amount must be positive'),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;

// Invoice validation
export const invoiceSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Reminder validation
export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  reminderType: z.enum(['task', 'follow_up', 'payment', 'deadline', 'custom']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  clientId: z.string().optional(),
  invoiceId: z.string().optional(),
  proposalId: z.string().optional(),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;

// Mark invoice paid validation
export const markInvoicePaidSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
});

export type MarkInvoicePaidFormData = z.infer<typeof markInvoicePaidSchema>;

