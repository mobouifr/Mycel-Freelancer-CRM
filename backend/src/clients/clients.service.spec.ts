import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  // 1. Mock all the Prisma models and methods used in the service
  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    proposal: {
      findMany: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Resets call counts between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Core CRUD Operations', () => {
    const userId = 'user-1337';
    const clientId = 'client-42';
    const mockClient = { id: clientId, name: '42 Network', userId };

    it('should create a client linked to the user', async () => {
      const dto = { name: '42 Network', email: 'test@42.ma' };
      mockPrismaService.client.create.mockResolvedValue(mockClient);

      const result = await service.create(userId, dto as any);
      
      expect(result).toEqual(mockClient);
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `New client created: ${mockClient.name}`,
          type: 'success',
        },
      });
    });

    it('should update a client and create a notification', async () => {
      const dto = { name: 'Updated Network' };
      const updatedClient = { ...mockClient, name: 'Updated Network' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient as any);
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update(userId, clientId, dto as any);
      
      expect(result).toEqual(updatedClient);
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: dto,
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `Client updated: ${updatedClient.name}`,
          type: 'info',
        },
      });
    });

    it('should delete a client and create a notification', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient as any);
      mockPrismaService.client.delete.mockResolvedValue(mockClient);

      const result = await service.remove(userId, clientId);
      
      expect(result).toEqual(mockClient);
      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: clientId },
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          message: `Client deleted: ${mockClient.name}`,
          type: 'warning',
        },
      });
    });

    it('should throw NotFoundException if client does not exist or belong to user', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      
      await expect(service.findOne(userId, 'wrong-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Relational Data Methods', () => {
    const userId = 'user-1337';
    const clientId = 'client-42';
    const mockProjects = [{ id: 'proj-1', clientId, userId }, { id: 'proj-2', clientId, userId }];

    beforeEach(() => {
      // Mock findOne so the ownership check passes in the relational methods
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: clientId, userId } as any);
    });

    it('should fetch projects for a specific client', async () => {
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      
      const result = await service.getProjects(userId, clientId);
      
      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({ where: { clientId, userId } });
    });

    it('should fetch proposals linked to the client projects', async () => {
      const mockProposals = [{ id: 'prop-1', projectId: 'proj-1' }];
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaService.proposal.findMany.mockResolvedValue(mockProposals);

      const result = await service.getProposals(userId, clientId);

      expect(result).toEqual(mockProposals);
      // Validates that the IN query extracts project IDs correctly
      expect(prisma.proposal.findMany).toHaveBeenCalledWith({
        where: { projectId: { in: ['proj-1', 'proj-2'] }, userId },
      });
    });

    it('should return an empty array for invoices if the client has no projects', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      
      const result = await service.getInvoices(userId, clientId);
      
      expect(result).toEqual([]);
      expect(prisma.invoice.findMany).not.toHaveBeenCalled(); // Ensures we don't query if array is empty
    });
  });
});