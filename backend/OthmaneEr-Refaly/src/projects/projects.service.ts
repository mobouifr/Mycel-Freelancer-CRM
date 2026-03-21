import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

export interface Project {
  id: number; 
  userid: number; 
  clientid: number;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'; //
  due_date: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'urgent'; //
}

@Injectable()
export class ProjectsService {

  private projects: Project[] = []; // fake ass databasss
  private nextId = 1;

  // CREATE
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
  update(id: number, updateProjectDto: UpdateProjectDto | any): Project {
    const projectIndex = this.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Merge existing project data with the incoming updates
    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...updateProjectDto,
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