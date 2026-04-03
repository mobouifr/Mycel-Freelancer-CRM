import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
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

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new client', async () => {
    const clientDto = { name: 'Othmane', email: 'othmane@example.com' };
    const mockOutput = { id: 'uuid-1', ...clientDto };
    
    mockPrismaService.client.create.mockResolvedValue(mockOutput);
    
    const result = await service.create(clientDto as any);
    expect(result).toMatchObject(mockOutput);
    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        name: clientDto.name,
        email: clientDto.email,
        phone: undefined,
        company: undefined,
        userId: '1',
      },
    });
  });

  it('should return all clients', async () => {
    const mockArray = [{ id: 'uuid-1', name: 'User 1' }, { id: 'uuid-2', name: 'User 2' }];
    mockPrismaService.client.findMany.mockResolvedValue(mockArray);

    const result = await service.findAll();
    expect(result).toEqual(mockArray);
    expect(prisma.client.findMany).toHaveBeenCalled();
  });

  it('should find a client by ID', async () => {
    const mockClient = { id: 'uuid-1', name: 'Find Me' };
    mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockClient);
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });

  it('should throw NotFoundException if client does not exist', async () => {
    mockPrismaService.client.findUnique.mockResolvedValue(null);
    await expect(service.findOne('uuid-999')).rejects.toThrow(NotFoundException);
  });

  it('should remove a client', async () => {
    const mockClient = { id: 'uuid-del', name: 'To Delete' };
    mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
    mockPrismaService.client.delete.mockResolvedValue(mockClient);
    
    const result = await service.remove('uuid-del');
    expect(result).toEqual(mockClient);
    expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: 'uuid-del' } });
  });
});
