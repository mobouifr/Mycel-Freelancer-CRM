import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    proposal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
    }
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

      const result = await service.create({ ...dto, userId } as any);

      expect(result.userId).toEqual(userId);
      expect(prisma.proposal.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a proposal if it exists and belongs to the user', async () => {
      const proposal = { id: 'prop-1', userId: 'user-456', title: 'Test' };
      mockPrismaService.proposal.findUnique.mockResolvedValue(proposal);

      const result = await service.findOne('prop-1');
      expect(result).toEqual(proposal);
    });

    it('should throw NotFoundException if proposal is not found', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(service.findOne('wrong-id')).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a proposal using id', async () => {
      const proposal = { id: 'prop-1', userId: 'user-456' };
      mockPrismaService.proposal.findUnique.mockResolvedValue(proposal);
      mockPrismaService.proposal.delete.mockResolvedValue(proposal);

      await service.remove('prop-1');
      expect(prisma.proposal.delete).toHaveBeenCalled();
    });
  });
});
