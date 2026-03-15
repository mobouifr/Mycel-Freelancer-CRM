// LocalStorage service - Mock data layer for frontend-only development
// This mimics the API structure and can be easily replaced with real API calls

import { Client, CreateClientDto, UpdateClientDto } from '../types/client.types';
import { Project, CreateProjectDto, UpdateProjectDto, ProjectStatus } from '../types/project.types';
import { Proposal, CreateProposalDto, UpdateProposalDto, ProposalStatus } from '../types/proposal.types';
import { Invoice, CreateInvoiceDto, UpdateInvoiceDto, MarkInvoicePaidDto, InvoiceStatus } from '../types/invoice.types';
import { Reminder, CreateReminderDto, UpdateReminderDto, ReminderStatus, ReminderPriority } from '../types/reminder.types';
import { ApiResponse } from '../types/common.types';

const STORAGE_KEYS = {
  CLIENTS: 'crm_clients',
  PROJECTS: 'crm_projects',
  PROPOSALS: 'crm_proposals',
  INVOICES: 'crm_invoices',
  REMINDERS: 'crm_reminders',
};

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Seed initial data if storage is empty
const seedInitialData = () => {
  if (getFromStorage(STORAGE_KEYS.CLIENTS).length === 0) {
    const sampleClients: Client[] = [
      {
        id: generateId(),
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0101',
        company: 'Acme Corp',
        notes: 'Long-term client, prefers email communication',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'demo-user',
      },
      {
        id: generateId(),
        name: 'Tech Startup Inc',
        email: 'hello@techstartup.com',
        phone: '+1-555-0102',
        company: 'Tech Startup Inc',
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'demo-user',
      },
    ];
    saveToStorage(STORAGE_KEYS.CLIENTS, sampleClients);
  }
};

// Initialize seed data on first load
if (typeof window !== 'undefined') {
  seedInitialData();
}

// Clients service
export const localStorageClientsService = {
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    return { data: clients, count: clients.length };
  },

  getById: async (id: string): Promise<Client> => {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const client = clients.find((c) => c.id === id);
    if (!client) throw new Error('Client not found');
    return client;
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const newClient: Client = {
      id: generateId(),
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
    };
    clients.push(newClient);
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  },

  update: async (id: string, data: UpdateClientDto): Promise<Client> => {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Client not found');
    clients[index] = {
      ...clients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return clients[index];
  },

  delete: async (id: string): Promise<void> => {
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const filtered = clients.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLIENTS, filtered);
  },
};

// Projects service
export const localStorageProjectsService = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    // Enrich with client data
    const enriched = projects.map((p) => ({
      ...p,
      client: clients.find((c) => c.id === p.clientId),
    }));
    return { data: enriched, count: enriched.length };
  },

  getById: async (id: string): Promise<Project> => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const project = projects.find((p) => p.id === id);
    if (!project) throw new Error('Project not found');
    return {
      ...project,
      client: clients.find((c) => c.id === project.clientId),
    };
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const newProject: Project = {
      id: generateId(),
      title: data.title,
      description: data.description || null,
      status: (data.status || ProjectStatus.ACTIVE) as ProjectStatus,
      budget: data.budget,
      deadline: data.deadline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
      clientId: data.clientId,
      client: clients.find((c) => c.id === data.clientId),
    };
    projects.push(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
      client: clients.find((c) => c.id === (data.clientId || projects[index].clientId)),
    };
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  },

  delete: async (id: string): Promise<void> => {
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const filtered = projects.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PROJECTS, filtered);
  },
};

// Proposals service
export const localStorageProposalsService = {
  getAll: async (): Promise<ApiResponse<Proposal[]>> => {
    const proposals = getFromStorage<Proposal>(STORAGE_KEYS.PROPOSALS);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const enriched = proposals.map((p) => {
      const project = projects.find((pr) => pr.id === p.projectId);
      return {
        ...p,
        project: project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined,
      };
    });
    return { data: enriched, count: enriched.length };
  },

  getById: async (id: string): Promise<Proposal> => {
    const proposals = getFromStorage<Proposal>(STORAGE_KEYS.PROPOSALS);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) throw new Error('Proposal not found');
    const project = projects.find((pr) => pr.id === proposal.projectId);
    return {
      ...proposal,
      project: project
        ? {
            ...project,
            client: clients.find((c) => c.id === project.clientId),
          }
        : undefined,
    };
  },

  create: async (data: CreateProposalDto): Promise<Proposal> => {
    const proposals = getFromStorage<Proposal>(STORAGE_KEYS.PROPOSALS);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const newProposal: Proposal = {
      id: generateId(),
      title: data.title,
      amount: data.amount,
      status: (data.status || ProposalStatus.DRAFT) as ProposalStatus,
      notes: data.notes || null,
      validUntil: data.validUntil || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
      projectId: data.projectId,
      project: (() => {
        const project = projects.find((p) => p.id === data.projectId);
        return project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined;
      })(),
    };
    proposals.push(newProposal);
    saveToStorage(STORAGE_KEYS.PROPOSALS, proposals);
    return newProposal;
  },

  update: async (id: string, data: UpdateProposalDto): Promise<Proposal> => {
    const proposals = getFromStorage<Proposal>(STORAGE_KEYS.PROPOSALS);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const index = proposals.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proposal not found');
    proposals[index] = {
      ...proposals[index],
      ...data,
      updatedAt: new Date().toISOString(),
      project: (() => {
        const projectId = data.projectId || proposals[index].projectId;
        const project = projects.find((p) => p.id === projectId);
        return project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined;
      })(),
    };
    saveToStorage(STORAGE_KEYS.PROPOSALS, proposals);
    return proposals[index];
  },

  delete: async (id: string): Promise<void> => {
    const proposals = getFromStorage<Proposal>(STORAGE_KEYS.PROPOSALS);
    const filtered = proposals.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PROPOSALS, filtered);
  },

  updateStatus: async (id: string, status: string): Promise<Proposal> => {
    return localStorageProposalsService.update(id, { status: status as any });
  },

  generatePDF: async (_id: string): Promise<Blob> => {
    // Mock PDF generation - returns empty blob
    return new Blob(['Mock PDF'], { type: 'application/pdf' });
  },

  convertToInvoice: async (id: string, dueDate?: string): Promise<any> => {
    const proposal = await localStorageProposalsService.getById(id);
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const newInvoice: Invoice = {
      id: generateId(),
      amount: proposal.amount,
      status: InvoiceStatus.PENDING,
      dueDate: dueDate || null,
      notes: `Converted from proposal: ${proposal.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
      projectId: proposal.projectId,
      project: proposal.project,
    };
    invoices.push(newInvoice);
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return newInvoice;
  },
};

// Invoices service
export const localStorageInvoicesService = {
  getAll: async (): Promise<ApiResponse<Invoice[]>> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const enriched = invoices.map((i) => {
      const project = projects.find((p) => p.id === i.projectId);
      return {
        ...i,
        project: project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined,
      };
    });
    return { data: enriched, count: enriched.length };
  },

  getById: async (id: string): Promise<Invoice> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) throw new Error('Invoice not found');
    const project = projects.find((p) => p.id === invoice.projectId);
    return {
      ...invoice,
      project: project
        ? {
            ...project,
            client: clients.find((c) => c.id === project.clientId),
          }
        : undefined,
    };
  },

  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const newInvoice: Invoice = {
      id: generateId(),
      amount: data.amount,
      status: (data.status || InvoiceStatus.PENDING) as InvoiceStatus,
      dueDate: data.dueDate || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
      projectId: data.projectId,
      project: (() => {
        const project = projects.find((p) => p.id === data.projectId);
        return project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined;
      })(),
      payments: [],
    };
    invoices.push(newInvoice);
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return newInvoice;
  },

  update: async (id: string, data: UpdateInvoiceDto): Promise<Invoice> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const clients = getFromStorage<Client>(STORAGE_KEYS.CLIENTS);
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    invoices[index] = {
      ...invoices[index],
      ...data,
      updatedAt: new Date().toISOString(),
      project: (() => {
        const projectId = data.projectId || invoices[index].projectId;
        const project = projects.find((p) => p.id === projectId);
        return project
          ? {
              ...project,
              client: clients.find((c) => c.id === project.clientId),
            }
          : undefined;
      })(),
    };
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return invoices[index];
  },

  delete: async (id: string): Promise<void> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const filtered = invoices.filter((i) => i.id !== id);
    saveToStorage(STORAGE_KEYS.INVOICES, filtered);
  },

  markPaid: async (id: string, data: MarkInvoicePaidDto): Promise<Invoice> => {
    const invoices = getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    invoices[index] = {
      ...invoices[index],
      status: InvoiceStatus.PAID,
      updatedAt: new Date().toISOString(),
      payments: [
        ...(invoices[index].payments || []),
        {
          id: generateId(),
          amount: data.amount,
          method: data.method,
          notes: data.notes || null,
          paidAt: new Date().toISOString(),
          invoiceId: id,
        },
      ],
    };
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return invoices[index];
  },

  generatePDF: async (_id: string): Promise<Blob> => {
    // Mock PDF generation
    return new Blob(['Mock PDF'], { type: 'application/pdf' });
  },
};

// Reminders service
export const localStorageRemindersService = {
  getAll: async (): Promise<ApiResponse<Reminder[]>> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    return { data: reminders, count: reminders.length };
  },

  getById: async (id: string): Promise<Reminder> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) throw new Error('Reminder not found');
    return reminder;
  },

  create: async (data: CreateReminderDto): Promise<Reminder> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const newReminder: Reminder = {
      id: generateId(),
      title: data.title,
      description: data.description || null,
      reminderType: data.reminderType,
      status: ReminderStatus.PENDING,
      priority: (data.priority || ReminderPriority.MEDIUM) as ReminderPriority,
      dueDate: data.dueDate,
      notifiedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'demo-user',
      clientId: data.clientId || null,
      invoiceId: data.invoiceId || null,
      proposalId: data.proposalId || null,
    };
    reminders.push(newReminder);
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return newReminder;
  },

  update: async (id: string, data: UpdateReminderDto): Promise<Reminder> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reminder not found');
    reminders[index] = {
      ...reminders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return reminders[index];
  },

  delete: async (id: string): Promise<void> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const filtered = reminders.filter((r) => r.id !== id);
    saveToStorage(STORAGE_KEYS.REMINDERS, filtered);
  },

  trigger: async (id: string): Promise<void> => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reminder not found');
    reminders[index].notifiedAt = new Date().toISOString();
    reminders[index].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
  },
};

