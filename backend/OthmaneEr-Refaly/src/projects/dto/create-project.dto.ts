export class CreateProjectDto {
  // Basic project info
  title: string;
  description?: string;

  // Status enum from architecture/docs
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';

  // Optional budget
  budget?: number;

  // (Optional) simple numeric client relation for now
  clientId?: string;
}
