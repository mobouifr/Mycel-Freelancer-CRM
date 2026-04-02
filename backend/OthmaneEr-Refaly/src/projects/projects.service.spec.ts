import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockGamificationService = {
  awardProjectCompletionXp: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new project', async () => {
    const createProjectDto = { title: 'Test Project', budget: 1000 };
    const mockOutput = { id: 'uuid-1', ...createProjectDto };
    
    mockPrismaService.project.create.mockResolvedValue(mockOutput);
    
    const result = await service.create(createProjectDto as any);
    expect(result).toMatchObject(mockOutput);
    expect(prisma.project.create).toHaveBeenCalled();
  });

  it('should return all projects', async () => {
    const mockArray = [{ id: 'uuid-1', title: 'P 1' }, { id: 'uuid-2', title: 'P 2' }];
    mockPrismaService.project.findMany.mockResolvedValue(mockArray);

    const result = await service.findAll();
    expect(result).toEqual(mockArray);
    expect(prisma.project.findMany).toHaveBeenCalled();
  });

  it('should find a project by ID', async () => {
    const mockProject = { id: 'uuid-1', title: 'Find Me' };
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockProject);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });

  it('should throw NotFoundException if project does not exist', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue(null);
    await expect(service.findOne('uuid-999')).rejects.toThrow(NotFoundException);
  });

  it('should remove a project', async () => {
    const mockProject = { id: 'uuid-del', title: 'To Delete' };
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
    mockPrismaService.project.delete.mockResolvedValue(mockProject);
    
    const result = await service.remove('uuid-del');
    expect(result).toEqual(mockProject);
    expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'uuid-del' } });
  });
});
