import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let prisma: PrismaService;

  // Create a mock for Prisma functions
  const mockPrismaService = {
    proposal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new proposal', async () => {
      const dto = { title: 'New Proposal', projectId: 'proj-123', amount: 1000 };
      const userId = 'user-456';
      
      mockPrismaService.proposal.create.mockResolvedValue({ id: 'prop-1', ...dto, userId });

      const result = await service.create(userId, dto as any);

      expect(result.userId).toEqual(userId);
      expect(prisma.proposal.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a proposal if it exists and belongs to the user', async () => {
      const proposal = { id: 'prop-1', userId: 'user-456', title: 'Test' };
      mockPrismaService.proposal.findFirst.mockResolvedValue(proposal);

      const result = await service.findOne('user-456', 'prop-1');
      expect(result).toEqual(proposal);
    });

    it('should throw NotFoundException if proposal is not found', async () => {
      mockPrismaService.proposal.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-456', 'wrong-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a proposal if the user owns it', async () => {
      const proposal = { id: 'prop-1', userId: 'user-456' };
      // findOne check passes
      mockPrismaService.proposal.findFirst.mockResolvedValue(proposal);
      mockPrismaService.proposal.delete.mockResolvedValue(proposal);

      await service.remove('user-456', 'prop-1');
      expect(prisma.proposal.delete).toHaveBeenCalledWith({ where: { id: 'prop-1' } });
    });
  });
});