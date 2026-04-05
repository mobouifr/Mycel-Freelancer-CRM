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
    const req = { user: { id: 'user-1' } };
    mockProjectsService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

    const result = await controller.create(req, dto as any);
    expect(result).toEqual({ id: 'uuid-1', title: 'Test Project' });
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('should get all projects', async () => {
    const req = { user: { id: 'user-1' } };
    mockProjectsService.findAll.mockResolvedValue([]);
    const result = await controller.findAll(req);
    expect(result).toEqual({ data: [] });
    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  it('should get one project', async () => {
    const req = { user: { id: 'user-1' } };
    mockProjectsService.findOne.mockResolvedValue({ id: 'uuid-1' });
    const result = await controller.findOne(req, 'uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.findOne).toHaveBeenCalledWith('user-1', 'uuid-1');
  });

  it('should update a project', async () => {
    const dto = { title: 'Updated' };
    const req = { user: { id: 'user-1' } };
    mockProjectsService.update.mockResolvedValue({ id: 'uuid-1', ...dto });
    const result = await controller.update(req, 'uuid-1', dto as any);
    expect(result).toEqual({ id: 'uuid-1', title: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('user-1', 'uuid-1', dto);
  });

  it('should remove a project', async () => {
    const req = { user: { id: 'user-1' } };
    mockProjectsService.remove.mockResolvedValue({ id: 'uuid-1' });
    const result = await controller.remove(req, 'uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.remove).toHaveBeenCalledWith('user-1', 'uuid-1');
  });
});
