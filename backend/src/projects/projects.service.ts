import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService
  ) {}

  private parseDeadline(value?: string): Date | null | undefined {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private normalizeStatus(status?: string): ProjectStatus | undefined {
    if (!status) return undefined;
    const normalized = status.toUpperCase();
    if (normalized === 'ACTIVE' || normalized === 'COMPLETED' || normalized === 'PAUSED' || normalized === 'CANCELLED') {
      return normalized as ProjectStatus;
    }
    return undefined;
  }

  async create(userId: string, createProjectDto: CreateProjectDto | any) {
    const resolvedDeadline = this.parseDeadline(createProjectDto.deadline ?? createProjectDto.due_date);
    const data: any = {
      title: createProjectDto.title || '',
      description: createProjectDto.description?.trim() || null,
      status: this.normalizeStatus(createProjectDto.status) ?? ProjectStatus.ACTIVE,
      budget: createProjectDto.budget !== undefined ? createProjectDto.budget : 0,
      userId,
      clientId: createProjectDto.clientId,
      ...(resolvedDeadline !== undefined ? { deadline: resolvedDeadline } : {}),
    };

    return await this.prisma.project.create({ data });
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

    const resolvedDeadline = this.parseDeadline(updateProjectDto.deadline ?? updateProjectDto.due_date);
    const normalizedStatus = this.normalizeStatus(updateProjectDto.status);

    const data: any = {
      ...(updateProjectDto.title !== undefined ? { title: updateProjectDto.title } : {}),
      ...(updateProjectDto.description !== undefined
        ? { description: updateProjectDto.description?.trim() || null }
        : {}),
      ...(updateProjectDto.budget !== undefined ? { budget: updateProjectDto.budget } : {}),
      ...(updateProjectDto.clientId !== undefined ? { clientId: updateProjectDto.clientId } : {}),
      ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
      ...(resolvedDeadline !== undefined ? { deadline: resolvedDeadline } : {}),
    };

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
    }

    return updatedProject;
  }
  
  async updateStatus(userId: string, id: string, status: string) {
    return await this.update(userId, id, { status });
  }

  async remove(userId: string, id: string) {
    const existingProject = await this.findOne(userId, id);
    return await this.prisma.project.delete({ where: { id } });
  }
}
