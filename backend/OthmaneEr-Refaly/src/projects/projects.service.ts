import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

export interface Project {
  id: number; // in DB this would be UUID
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  budget?: number;
  clientId?: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ProjectsService {
  // In-memory array acting as the database
  private projects: Project[] = [];
  private nextId = 1;

  // CREATE
  create(createProjectDto: CreateProjectDto): Project {
    const now = new Date();

    const newProject: Project = {
      id: this.nextId++,
      status: createProjectDto.status ?? 'planned', // default status
      created_at: now,
      updated_at: now,
      ...createProjectDto, // title, description, budget, clientId, etc.
    };

    this.projects.push(newProject);
    return newProject;
  }

  // READ (All)
  findAll(): Project[] {
    return this.projects;
  }

  // READ (One)
  findOne(id: number): Project {
    const project = this.projects.find((p) => p.id === id);

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // UPDATE
  update(id: number, updateProjectDto: UpdateProjectDto): Project {
    const projectIndex = this.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updateProjectDto,
      updated_at: new Date(),
    };

    return this.projects[projectIndex];
  }

  // DELETE
  remove(id: number): Project {
    const projectIndex = this.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const [deletedProject] = this.projects.splice(projectIndex, 1);
    return deletedProject;
  }
}
