// Client types based on Prisma schema

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

