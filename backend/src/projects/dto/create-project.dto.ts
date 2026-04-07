export class CreateProjectDto {
  // Basic project info
  title: string;
  description?: string;

  // Status enum aligned with Prisma schema
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

  // Optional budget
  budget?: number;

  // Optional deadline from frontend form
  deadline?: string;

  // Frontend sends priority but it is not persisted in current Prisma Project model
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';

  // (Optional) simple numeric client relation for now
  clientId?: string;
}
