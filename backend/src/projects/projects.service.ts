import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
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
    if (!createProjectDto.clientId) {
      throw new BadRequestException('clientId is required to create a project');
    }

    const clientExists = await this.prisma.client.findFirst({
      where: { id: createProjectDto.clientId, userId }
    });

    if (!clientExists) {
      throw new BadRequestException('The provided clientId is invalid or does not belong to your account');
    }

    const resolvedDeadline = this.parseDeadline(createProjectDto.deadline ?? createProjectDto.due_date);
    const rawBudget = Number(createProjectDto.budget ?? 0);
    const data: any = {
      title: createProjectDto.title || '',
      description: createProjectDto.description?.trim() || null,
      status: this.normalizeStatus(createProjectDto.status) ?? ProjectStatus.ACTIVE,
      priority: createProjectDto.priority ?? 'MEDIUM',
      budget: Number.isFinite(rawBudget) ? rawBudget : 0,
      userId,
      clientId: createProjectDto.clientId,
      ...(resolvedDeadline !== undefined ? { deadline: resolvedDeadline } : {}),
    };

    const project = await this.prisma.project.create({ data });

    this.notificationsService.create(userId, {
      title: 'Project Created',
      message: `New project created: ${project.title}`,
      type: 'success',
      targetType: 'project',
      targetId: project.id,
    }).catch(() => {});

    return project;
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (search?.trim()) {
      where.OR = [
        { title:       { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status as ProjectStatus;
    }
    const allowedSortFields = ['title', 'budget', 'deadline', 'createdAt'];
    const safeSortBy  = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrd = sortOrder === 'asc' ? 'asc' : 'desc';
    const [data, count] = await Promise.all([
      this.prisma.project.findMany({ where, skip, take: limit, orderBy: { [safeSortBy]: safeSortOrd }, include: { client: true } }),
      this.prisma.project.count({ where }),
    ]);
    return { data, count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
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
      ...(updateProjectDto.budget !== undefined ? {
        budget: Number.isFinite(Number(updateProjectDto.budget)) ? Number(updateProjectDto.budget) : 0,
      } : {}),
      ...(updateProjectDto.clientId !== undefined ? { clientId: updateProjectDto.clientId } : {}),
      ...(updateProjectDto.priority !== undefined ? { priority: updateProjectDto.priority } : {}),
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
      const priority = updateProjectDto.priority || (existingProject as any).priority || 'MEDIUM';
      
      this.gamificationService.awardProjectCompletionXp(
        userId,
        Number(updatedProject.budget),
        priority
      ).catch((err) => this.logger.error('Gamification XP error', err));

      this.gamificationService.checkAchievementsAndBadges(userId, updatedProject.id)
        .catch((err) => this.logger.error('Gamification badges error', err));
    }

    this.notificationsService.create(userId, {
      title: 'Project Updated',
      message: `Project updated: ${updatedProject.title}`,
      type: 'info',
      targetType: 'project',
      targetId: updatedProject.id,
    }).catch(() => {});

    return updatedProject;
  }
  
  async updateStatus(userId: string, id: string, status: string) {
    return await this.update(userId, id, { status });
  }

  async remove(userId: string, id: string) {
    const existingProject = await this.findOne(userId, id);

    const deleted = await this.prisma.project.delete({ where: { id } });

    this.notificationsService.create(userId, {
      title: 'Project Deleted',
      message: `Project deleted: ${existingProject.title}`,
      type: 'warning',
    }).catch(() => {});

    return deleted;
  }
}
