import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a project', async () => {
    const dto = { title: 'Test Project' };
    mockProjectsService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

    const result = await controller.create(dto as any);
    expect(result).toEqual({ id: 'uuid-1', title: 'Test Project' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should get all projects', async () => {
    mockProjectsService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('should get one project', async () => {
    mockProjectsService.findOne.mockResolvedValue({ id: 'uuid-1' });
    const result = await controller.findOne('uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update a project', async () => {
    const dto = { title: 'Updated' };
    mockProjectsService.update.mockResolvedValue({ id: 'uuid-1', ...dto });
    const result = await controller.update('uuid-1', dto);
    expect(result).toEqual({ id: 'uuid-1', title: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('should remove a project', async () => {
    mockProjectsService.remove.mockResolvedValue({ id: 'uuid-1' });
    const result = await controller.remove('uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
