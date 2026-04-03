import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new customer', async () => {
    const customerDto = { name: 'Othmane', email: 'othmane@example.com' };
    const mockOutput = { id: 'uuid-1', ...customerDto };
    
    mockPrismaService.client.create.mockResolvedValue(mockOutput);
    
    const result = await service.create(customerDto as any);
    expect(result).toMatchObject(mockOutput);
    expect(prisma.client.create).toHaveBeenCalledWith({ data: customerDto });
  });

  it('should return all customers', async () => {
    const mockArray = [{ id: 'uuid-1', name: 'User 1' }, { id: 'uuid-2', name: 'User 2' }];
    mockPrismaService.client.findMany.mockResolvedValue(mockArray);

    const result = await service.findAll();
    expect(result).toEqual(mockArray);
    expect(prisma.client.findMany).toHaveBeenCalled();
  });

  it('should find a customer by ID', async () => {
    const mockCustomer = { id: 'uuid-1', name: 'Find Me' };
    mockPrismaService.client.findUnique.mockResolvedValue(mockCustomer);

    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockCustomer);
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    mockPrismaService.client.findUnique.mockResolvedValue(null);
    await expect(service.findOne('uuid-999')).rejects.toThrow(NotFoundException);
  });

  it('should remove a customer', async () => {
    const mockCustomer = { id: 'uuid-del', name: 'To Delete' };
    mockPrismaService.client.findUnique.mockResolvedValue(mockCustomer);
    mockPrismaService.client.delete.mockResolvedValue(mockCustomer);
    
    const result = await service.remove('uuid-del');
    expect(result).toEqual(mockCustomer);
    expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: 'uuid-del' } });
  });
});
