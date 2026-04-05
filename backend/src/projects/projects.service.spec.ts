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
  };

  // Mock Gamification methods
  const mockGamificationService = {
    awardProjectCompletionXp: jest.fn(),
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
    it('should create a new project', async () => {
      const userId = 'user-123';
      const dto = { title: 'New CRM Feature', status: 'ACTIVE', budget: 1000 };
      const mockResult = { id: 'proj-1', ...dto, userId };

      mockPrismaService.project.create.mockResolvedValue(mockResult);

      const result = await service.create(userId, dto);
      expect(result).toEqual(mockResult);
      expect(prisma.project.create).toHaveBeenCalled();
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
    it('should award XP when status changes to COMPLETED', async () => {
      const userId = 'user-123';
      const existingProject = { id: 'proj-1', userId, status: 'ACTIVE', budget: 1000 };
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
    });

    it('should NOT award XP if status is not changed to COMPLETED', async () => {
      const userId = 'user-123';
      const existingProject = { id: 'proj-1', userId, status: 'ACTIVE', budget: 1000 };
      const updatedProject = { ...existingProject, status: 'IN_PROGRESS' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProject as any);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      await service.update(userId, 'proj-1', { status: 'IN_PROGRESS' });

      expect(gamification.awardProjectCompletionXp).not.toHaveBeenCalled();
    });
  });
});