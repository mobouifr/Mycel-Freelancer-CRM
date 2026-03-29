import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// NEW: Import the GamificationService so we can trigger the math
import { GamificationService } from '../gamification/gamification.service';

export interface Project {
  id: number; 
  userid: number; 
  clientid: number;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'; 
  due_date: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'urgent'; 
}

@Injectable()
export class ProjectsService {
  private projects: Project[] = [];
  private nextId = 1;

  // NEW: Inject GamificationService into the constructor
  constructor(private readonly gamificationService: GamificationService) {}

  create(createProjectDto: CreateProjectDto | any): Project {
    const newProject: Project = {
      id: this.nextId++,
      userid: createProjectDto.userid !== undefined ? createProjectDto.userid : 1,
      clientid: createProjectDto.clientid !== undefined ? createProjectDto.clientid : 1,
      title: createProjectDto.title || '',
      description: createProjectDto.description || '',
      status: createProjectDto.status || 'planned',
      due_date: createProjectDto.due_date || '',
      budget: createProjectDto.budget !== undefined ? createProjectDto.budget : 0,
      priority: createProjectDto.priority || 'medium',
    };

    this.projects.push(newProject);
    return newProject;
  }

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: number): Project {
    const project = this.projects.find((p) => p.id === id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  update(id: number, updateProjectDto: UpdateProjectDto | any): Project {
    const projectIndex = this.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // NEW: Capture the status before applying any updates
    const oldStatus = this.projects[projectIndex].status;

    // Apply the updates to the project
    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updateProjectDto,
    };

    // NEW: Capture the status after applying the updates
    const newStatus = this.projects[projectIndex].status;

    // NEW: The Trigger! If it changed to 'completed', award the XP
    if (oldStatus !== 'completed' && newStatus === 'completed') {
      const project = this.projects[projectIndex];
      
      this.gamificationService.awardProjectCompletionXp(
        project.userid,
        project.budget,
        project.priority
      );
    }

    return this.projects[projectIndex];
  }

  remove(id: number): Project {
    const projectIndex = this.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const [deletedProject] = this.projects.splice(projectIndex, 1);
    return deletedProject;
  }
}