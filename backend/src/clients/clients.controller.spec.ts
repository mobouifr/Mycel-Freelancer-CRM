import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

const mockClientsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a client', async () => {
    const clientDto = { name: 'Test', email: 'test@test.com' };
    const mockResult = { id: 'uuid-1', ...clientDto };
    const req = { user: { id: 'user-1' } };
    mockClientsService.create.mockResolvedValue(mockResult);

    const result = await controller.create(req, clientDto as any);
    expect(result).toEqual(mockResult);
    expect(service.create).toHaveBeenCalledWith('user-1', clientDto);
  });

  it('should return all clients', async () => {
    const mockResult = [{ id: 'uuid-1', name: 'Test' }];
    const req = { user: { id: 'user-1' } };
    mockClientsService.findAll.mockResolvedValue(mockResult);

    const result = await controller.findAll(req);
    expect(result).toEqual(mockResult);
    expect(service.findAll).toHaveBeenCalledWith('user-1', 1, 10, undefined, undefined, 'desc');
  });

  it('should find one client', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    const req = { user: { id: 'user-1' } };
    mockClientsService.findOne.mockResolvedValue(mockResult);

    const result = await controller.findOne(req, 'uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.findOne).toHaveBeenCalledWith('user-1', 'uuid-1');
  });

  it('should update a client', async () => {
    const updateDto = { name: 'Updated' };
    const mockResult = { id: 'uuid-1', ...updateDto };
    const req = { user: { id: 'user-1' } };
    mockClientsService.update.mockResolvedValue(mockResult);

    const result = await controller.update(req, 'uuid-1', updateDto as any);
    expect(result).toEqual(mockResult);
    expect(service.update).toHaveBeenCalledWith('user-1', 'uuid-1', updateDto);
  });

  it('should remove a client', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    const req = { user: { id: 'user-1' } };
    mockClientsService.remove.mockResolvedValue(mockResult);

    const result = await controller.remove(req, 'uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.remove).toHaveBeenCalledWith('user-1', 'uuid-1');
  });
});
