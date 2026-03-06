/* ─────────────────────────────────────────────
   SHARED TYPES — Single source of truth
   All entity types mirror the backend schema.
───────────────────────────────────────────── */

// ── Auth ────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── User ────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  businessAddress?: string;
  logoUrl?: string;
  phone?: string;
  defaultCurrency: string;
  taxRate?: number;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Client ──────────────────────────────────
export type ClientStatus = 'active' | 'inactive' | 'archived';

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Project ─────────────────────────────────
export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  budget?: number;
  actualCost?: number;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

// ── Proposal ────────────────────────────────
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

export interface ProposalLineItem {
  id: string;
  proposalId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  order: number;
}

export interface Proposal {
  id: string;
  userId: string;
  clientId: string;
  projectId?: string;
  proposalNumber: string;
  title: string;
  description?: string;
  status: ProposalStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  validUntil?: string;
  terms?: string;
  notes?: string;
  pdfUrl?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  lineItems?: ProposalLineItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Invoice ─────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  order: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  projectId?: string;
  proposalId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  pdfUrl?: string;
  sentAt?: string;
  viewedAt?: string;
  lineItems?: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Reminder ────────────────────────────────
export type ReminderType = 'task' | 'follow_up' | 'payment' | 'deadline' | 'custom';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed';

export interface Reminder {
  id: string;
  userId: string;
  clientId?: string;
  invoiceId?: string;
  proposalId?: string;
  title: string;
  description?: string;
  reminderType: ReminderType;
  dueDate: string;
  status: ReminderStatus;
  priority: Priority;
  notifiedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Notification ────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Dashboard Stats ─────────────────────────
export interface DashboardStats {
  netRevenue: number;
  revenueChange: number;
  activeClients: number;
  newClientsThisMonth: number;
  pendingInvoices: number;
  overdueCount: number;
  totalBalance: number;
  revenueData: number[];
}

export interface RecentActivity {
  type: 'Invoice' | 'Proposal';
  client: string;
  amount: string;
  status: string;
  date: string;
}

// ── Settings ────────────────────────────────
export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  defaultCurrency: string;
  taxRate: number;
  logoUrl: string;
}

// ── API ─────────────────────────────────────
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Navigation ──────────────────────────────
export interface NavItem {
  icon: string;
  label: string;
  path: string;
}
