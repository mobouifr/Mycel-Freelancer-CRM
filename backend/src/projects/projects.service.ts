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

  async create(userId: string, createProjectDto: CreateProjectDto | any) {
    const data: any = {
      title: createProjectDto.title || '',
      description: createProjectDto.description || null,
      status: createProjectDto.status || 'ACTIVE',
      budget: createProjectDto.budget !== undefined ? createProjectDto.budget : 0,
      userId: userId,
      clientId: createProjectDto.clientId,
    };
    if (createProjectDto.deadline) {
        data.deadline = new Date(createProjectDto.deadline);
    } else if (createProjectDto.due_date) {
        data.deadline = new Date(createProjectDto.due_date);
    }
    
    const project = await this.prisma.project.create({ data });

    await this.prisma.notification.create({
      data: {
        userId,
        message: `New project created: ${project.title}`,
        type: 'SUCCESS',
      },
    });

    return project;
  }

  async findAll(userId: string) {
    return await this.prisma.project.findMany({ 
      where: { userId },
      include: { client: true }
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({ 
      where: { id },
      include: { client: true } 
    });
    if (!project || project.userId !== userId) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto | any) {
    const existingProject = await this.findOne(userId, id);

    const oldStatus = existingProject.status;

    const data: any = {
      ...updateProjectDto
    };
    if (updateProjectDto.deadline) {
        data.deadline = new Date(updateProjectDto.deadline);
    } else if (updateProjectDto.due_date) {
        data.deadline = new Date(updateProjectDto.due_date);
        delete data.due_date;
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data,
      include: { client: true }
    });

    const newStatus = updatedProject.status;

    if (oldStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
      const priority = updateProjectDto.priority || 'MEDIUM';
      
      this.gamificationService.awardProjectCompletionXp(
        userId,
        Number(updatedProject.budget),
        priority
      );

      this.gamificationService.checkAchievementsAndBadges(userId, updatedProject.id);
    }

    await this.prisma.notification.create({
      data: {
        userId,
        message: `Project updated: ${updatedProject.title}`,
        type: 'INFO',
      },
    });

    return updatedProject;
  }
  
  async updateStatus(userId: string, id: string, status: string) {
    return await this.update(userId, id, { status });
  }

  async remove(userId: string, id: string) {
    const existingProject = await this.findOne(userId, id);
    
    await this.prisma.notification.create({
      data: {
        userId,
        message: `Project deleted: ${existingProject.title}`,
        type: 'WARNING',
      },
    });

    return await this.prisma.project.delete({ where: { id } });
  }
}
