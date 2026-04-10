/* ─────────────────────────────────────────────
   SHARED TYPES — Single source of truth
   All entity types mirror the backend schema.
───────────────────────────────────────────── */

// ── Auth ────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

/** Backend sets JWT in HttpOnly cookie — no token in response body.
 *  When 2FA is enabled the login endpoint returns isTwoFactorRequired
 *  instead of a user — the frontend must redirect to the 2FA page. */
export interface AuthResponse {
  message?: string;
  user?: User;
  isTwoFactorRequired?: boolean;
  userId?: string;
}

// ── User ────────────────────────────────────
export interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  createdAt: string;
  intraId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  updatedAt?: string;
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

// ── Reminder ────────────────────────────────
export type ReminderType = 'task' | 'follow_up' | 'payment' | 'deadline' | 'custom';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed';

export interface Reminder {
  id: string;
  userId: string;
  clientId?: string;
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
  revenueData: number[];
}

export interface RecentActivity {
  type: 'Project' | 'Client';
  client: string;
  amount: string;
  status: string;
  date: string;
}

// ── Settings ────────────────────────────────
export interface ProfileSettings {
  name: string;
  email: string;
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
