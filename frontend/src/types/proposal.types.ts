// Proposal types based on Prisma schema

export const ProposalStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus];

export interface Proposal {
  id: string;
  title: string;
  amount: number;
  status: ProposalStatus;
  notes: string | null;
  validUntil: string | null;
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
}

export interface CreateProposalDto {
  title: string;
  amount: number;
  status?: ProposalStatus;
  notes?: string;
  validUntil?: string;
  projectId: string;
}

export interface UpdateProposalDto {
  title?: string;
  amount?: number;
  status?: ProposalStatus;
  notes?: string;
  validUntil?: string;
  projectId?: string;
}

