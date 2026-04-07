// LocalStorage service - Mock data layer for frontend-only development
// This mimics the API structure and can be easily replaced with real API calls

import { type Client, type CreateClientDto, type UpdateClientDto } from '../types/client.types';
import { type Project, type CreateProjectDto, type UpdateProjectDto, ProjectPriority, ProjectStatus } from '../types/project.types';
import { type ApiResponse } from '../types/common.types';

const STORAGE_KEYS = {
  CLIENTS: 'crm_clients',
  PROJECTS: 'crm_projects',
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
      priority: (data.priority || ProjectPriority.MEDIUM) as ProjectPriority,
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

  // Update project status
  updateStatus: async (id: string, status: string): Promise<Project> => {
    return localStorageProjectsService.update(id, { status: status as ProjectStatus });
  },
};


