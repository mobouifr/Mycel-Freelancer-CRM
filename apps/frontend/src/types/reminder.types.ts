// Reminder types
// Note: Reminders model may not exist in current schema, but types are defined for future implementation

export enum ReminderType {
  TASK = 'task',
  FOLLOW_UP = 'follow_up',
  PAYMENT = 'payment',
  DEADLINE = 'deadline',
  CUSTOM = 'custom',
}

export enum ReminderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
}

export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminderType: ReminderType;
  status: ReminderStatus;
  priority: ReminderPriority;
  dueDate: string;
  notifiedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clientId?: string | null;
  invoiceId?: string | null;
  proposalId?: string | null;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  reminderType: ReminderType;
  priority?: ReminderPriority;
  dueDate: string;
  clientId?: string;
  invoiceId?: string;
  proposalId?: string;
}

export interface UpdateReminderDto {
  title?: string;
  description?: string;
  reminderType?: ReminderType;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  dueDate?: string;
  clientId?: string;
  invoiceId?: string;
  proposalId?: string;
}

