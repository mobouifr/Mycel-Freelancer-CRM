// Validation schemas using Zod
import { z } from 'zod';

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string()
    .refine(
      (val) => !val || /^\+?[\d\s\-().]{7,20}$/.test(val),
      'Invalid phone number format'
    )
    .optional()
    .or(z.literal('')),
  company: z.string().max(200, 'Company name must be less than 200 characters').optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Project validation
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  budget: z.number()
    .refine((val) => Number.isFinite(val), 'Budget must be a valid number')
    .min(0, 'Budget must be 0 or more')
    .max(99_999_999.99, 'Budget cannot exceed 99,999,999.99'),
  deadline: z.string()
    .refine(
      (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      'Date must be in DD/MM/YYYY format'
    )
    .optional()
    .or(z.literal('')),
  clientId: z.string().min(1, 'Client is required'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;


