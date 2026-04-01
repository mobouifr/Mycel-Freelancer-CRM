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
    mockClientsService.create.mockResolvedValue(mockResult);

    const result = await controller.create(clientDto as any);
    expect(result).toEqual(mockResult);
    expect(service.create).toHaveBeenCalledWith(clientDto);
  });

  it('should return all clients', async () => {
    const mockResult = [{ id: 'uuid-1', name: 'Test' }];
    mockClientsService.findAll.mockResolvedValue(mockResult);

    const result = await controller.findAll();
    expect(result).toEqual(mockResult);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one client', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    mockClientsService.findOne.mockResolvedValue(mockResult);

    const result = await controller.findOne('uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update a client', async () => {
    const updateDto = { name: 'Updated' };
    const mockResult = { id: 'uuid-1', ...updateDto };
    mockClientsService.update.mockResolvedValue(mockResult);

    const result = await controller.update('uuid-1', updateDto as any);
    expect(result).toEqual(mockResult);
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateDto);
  });

  it('should remove a client', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    mockClientsService.remove.mockResolvedValue(mockResult);

    const result = await controller.remove('uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
