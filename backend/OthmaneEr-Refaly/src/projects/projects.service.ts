import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService
  ) {}

  async create(createProjectDto: CreateProjectDto | any) {
    const data: any = {
      title: createProjectDto.title || '',
      description: createProjectDto.description || '',
      status: createProjectDto.status || 'ACTIVE',
      budget: createProjectDto.budget !== undefined ? createProjectDto.budget : 0,
    };
    if (createProjectDto.due_date) {
        data.deadline = new Date(createProjectDto.due_date);
    }
    return await this.prisma.project.create({ data });
  }

  async findAll() {
    return await this.prisma.project.findMany();
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto | any) {
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const oldStatus = existingProject.status;

    const data: any = {
      ...updateProjectDto
    };
    if (updateProjectDto.due_date) {
        data.deadline = new Date(updateProjectDto.due_date);
        delete data.due_date;
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data
    });

    const newStatus = updatedProject.status;

    if (oldStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
      const userid = updateProjectDto.userid || 'uuid-user';
      const priority = updateProjectDto.priority || 'medium';
      
      this.gamificationService.awardProjectCompletionXp(
        userid,
        Number(updatedProject.budget),
        priority
      );
    }

    return updatedProject;
  }

  async remove(id: string) {
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return await this.prisma.project.delete({ where: { id } });
  }
}
