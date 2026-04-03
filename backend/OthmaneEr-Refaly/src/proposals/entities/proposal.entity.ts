export class Proposal {
  id: number;
  projectId: number;    // Select a project
  title: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  validUntil: string;   // Date string
  notes: string;
}