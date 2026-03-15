// Invoice types based on Prisma schema

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId: string;
  project?: {
    id: string;
    title: string;
    client?: {
      id: string;
      name: string;
    };
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  paidAt: string;
  invoiceId: string;
}

export interface CreateInvoiceDto {
  amount: number;
  status?: InvoiceStatus;
  dueDate?: string;
  notes?: string;
  projectId: string;
}

export interface UpdateInvoiceDto {
  amount?: number;
  status?: InvoiceStatus;
  dueDate?: string;
  notes?: string;
  projectId?: string;
}

export interface MarkInvoicePaidDto {
  amount: number;
  method: string;
  notes?: string;
}

