// Project types based on Prisma schema

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  budget: number;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    company: string | null;
  };
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  status?: ProjectStatus;
  budget: number;
  deadline?: string;
  clientId: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  deadline?: string;
  clientId?: string;
}

