import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;
  let gamification: GamificationService;

  // Mock Prisma methods
  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  };

  // Mock Gamification methods
  const mockGamificationService = {
    awardProjectCompletionXp: jest.fn(),
    checkAchievementsAndBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
    gamification = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project and send a notification', async () => {
      const userId = 'user-123';
      const dto = { title: 'New CRM Feature', status: 'ACTIVE', budget: 1000 };
      const mockResult = { id: 'proj-1', ...dto, userId };

      mockPrismaService.project.create.mockResolvedValue(mockResult);

      const result = await service.create(userId, dto);
      expect(result).toEqual(mockResult);
      expect(prisma.project.create).toHaveBeenCalled();
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `New project created: ${mockResult.title}`,
          type: 'success',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a project if it belongs to the user', async () => {
      const userId = 'user-123';
      const mockProject = { id: 'proj-1', userId, title: 'Test' };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne(userId, 'proj-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project belongs to someone else', async () => {
      const mockProject = { id: 'proj-1', userId: 'different-user' };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.findOne('user-123', 'proj-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update & gamification', () => {
    it('should award XP and check achievements when status changes to COMPLETED', async () => {
      const userId = 'user-123';
      const existingProject = { id: 'proj-1', userId, status: 'ACTIVE', budget: 1000, title: 'Test' };
      const updatedProject = { ...existingProject, status: 'COMPLETED' };

      // Mock findOne to pass the ownership check
      jest.spyOn(service, 'findOne').mockResolvedValue(existingProject as any);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      await service.update(userId, 'proj-1', { status: 'COMPLETED', priority: 'HIGH' });

      // Verify the GamificationService was triggered
      expect(gamification.awardProjectCompletionXp).toHaveBeenCalledWith(
        userId,
        1000,
        'HIGH'
      );
      expect(gamification.checkAchievementsAndBadges).toHaveBeenCalledWith(userId, updatedProject.id);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `Project updated: ${updatedProject.title}`,
          type: 'info',
        },
      });
    });

    it('should update without XP but STILL trigger notification', async () => {
      const userId = 'user-123';
      const existingProject = { id: 'proj-1', userId, status: 'ACTIVE', budget: 1000, title: 'Test' };
      const updatedProject = { ...existingProject, status: 'IN_PROGRESS' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProject as any);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      await service.update(userId, 'proj-1', { status: 'IN_PROGRESS' });

      expect(gamification.awardProjectCompletionXp).not.toHaveBeenCalled();
      
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `Project updated: ${updatedProject.title}`,
          type: 'info',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a project and send a WARNING notification', async () => {
      const userId = 'user-123';
      const mockProject = { id: 'proj-1', userId, title: 'To Be Deleted' };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProject as any);
      mockPrismaService.project.delete.mockResolvedValue(mockProject);

      await service.remove(userId, 'proj-1');

      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'proj-1' } });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `Project deleted: ${mockProject.title}`,
          type: 'warning',
        },
      });
    });
  });
});