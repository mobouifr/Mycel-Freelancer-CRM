import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

const mockCustomersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const customerDto = { name: 'Test', email: 'test@test.com' };
    const mockResult = { id: 'uuid-1', ...customerDto };
    mockCustomersService.create.mockResolvedValue(mockResult);

    const result = await controller.create(customerDto as any);
    expect(result).toEqual(mockResult);
    expect(service.create).toHaveBeenCalledWith(customerDto);
  });

  it('should return all customers', async () => {
    const mockResult = [{ id: 'uuid-1', name: 'Test' }];
    mockCustomersService.findAll.mockResolvedValue(mockResult);

    const result = await controller.findAll();
    expect(result).toEqual(mockResult);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one customer', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    mockCustomersService.findOne.mockResolvedValue(mockResult);

    const result = await controller.findOne('uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update a customer', async () => {
    const updateDto = { name: 'Updated' };
    const mockResult = { id: 'uuid-1', ...updateDto };
    mockCustomersService.update.mockResolvedValue(mockResult);

    const result = await controller.update('uuid-1', updateDto as any);
    expect(result).toEqual(mockResult);
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateDto);
  });

  it('should remove a customer', async () => {
    const mockResult = { id: 'uuid-1', name: 'Test' };
    mockCustomersService.remove.mockResolvedValue(mockResult);

    const result = await controller.remove('uuid-1');
    expect(result).toEqual(mockResult);
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
