import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let mockPrismaService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      userAchievement: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      userBadge: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    mockNotificationsService = {
      create: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should award XP but NOT level up when total XP stays below next threshold', async () => {
    const userId = 'user-uuid-1';
    // Level formula: xpForLevel(L) = 500 * L^2
    // Level 1 = 500 XP, Level 2 = 2000 XP, Level 3 = 4500 XP
    //
    // Arrange: User is at Level 1 with 500 XP (exactly on the Level 1 threshold).
    // Award a 'medium' project: 500 * 0.8 = 400 XP.
    // New total: 900 XP — still below 2000, so they stay Level 1.
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 500, level: 1 });
    mockPrismaService.user.update.mockResolvedValue({});

    const result = await service.awardProjectCompletionXp(userId, 0, 'medium');

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result.xpAwarded).toBe(400);
    expect(result.newTotalXp).toBe(900);
    expect(result.newLevel).toBe(1);    // 900 < 2000, stays Level 1
    expect(result.leveledUp).toBe(false);

    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { xp: 900, level: 1 },
    });
  });

  it('should award XP but NOT level up from Level 2 when threshold not met', async () => {
    const userId = 'user-uuid-3';
    // Level formula: Level 2 = 2000 XP, Level 3 = 4500 XP.
    //
    // Arrange: User is at Level 2 with 2000 XP.
    // Award a 'low' project: 500 * 0.5 = 250 XP.
    // New total: 2250 XP — below 4500, so they stay Level 2.
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 2000, level: 2 });
    mockPrismaService.user.update.mockResolvedValue({});

    const result = await service.awardProjectCompletionXp(userId, 0, 'low');

    expect(result.xpAwarded).toBe(250);
    expect(result.newTotalXp).toBe(2250);
    expect(result.newLevel).toBe(2);    // 2250 < 4500, stays Level 2
    expect(result.leveledUp).toBe(false);
  });

  describe('checkAchievementsAndBadges', () => {
    it('should award FIRST_PROJECT achievement if 1 project completed', async () => {
      const userId = 'user-1';
      const projectId = 'proj-1';
      mockPrismaService.project.findUnique.mockResolvedValue({ id: projectId, budget: 1000 });
      mockPrismaService.project.count.mockResolvedValue(1); // 1 completed project
      mockPrismaService.userAchievement.findUnique.mockResolvedValue(null); // not earned yet

      await service.checkAchievementsAndBadges(userId, projectId);

      expect(mockPrismaService.userAchievement.create).toHaveBeenCalledWith({
        data: { userId, type: 'FIRST_PROJECT', name: 'First Project Completed' }
      });
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ type: 'achievement' })
      );
    });

    it('should award LOYAL_CLIENT_3 achievement and HIGH_ROLLER badge', async () => {
      const userId = 'user-1';
      const projectId = 'proj-1';
      mockPrismaService.project.findUnique.mockResolvedValue({ 
        id: projectId, 
        budget: 15000, // HIGH_ROLLER criteria
        clientId: 'client-1' 
      });
      
      // Mock count to return something else for total projects, but 3 for client projects
      mockPrismaService.project.count.mockImplementation((args: { where?: { clientId?: string } }) => {
        if (args?.where?.clientId) return 3; // 3 projects for this client
        return 5; // 5 total projects
      });
      
      mockPrismaService.userAchievement.findUnique.mockResolvedValue(null);
      mockPrismaService.userBadge.findUnique.mockResolvedValue(null);

      await service.checkAchievementsAndBadges(userId, projectId);

      expect(mockPrismaService.userAchievement.create).toHaveBeenCalledWith({
        data: { userId, type: 'LOYAL_CLIENT_3', name: 'Loyalty: 3 Projects with a Client' }
      });
      
      expect(mockPrismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId, type: 'HIGH_ROLLER', name: 'High Roller' }
      });
    });

    it('should award EARLY_BIRD badge if completed before deadline', async () => {
      const userId = 'user-1';
      const projectId = 'proj-1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days in future

      mockPrismaService.project.findUnique.mockResolvedValue({ 
        id: projectId, 
        budget: 1000,
        deadline: futureDate
      });
      mockPrismaService.project.count.mockResolvedValue(5);
      mockPrismaService.userBadge.findUnique.mockResolvedValue(null);

      await service.checkAchievementsAndBadges(userId, projectId);

      expect(mockPrismaService.userBadge.create).toHaveBeenCalledWith({
        data: { userId, type: 'EARLY_BIRD', name: 'Early Bird' }
      });
    });

    it('should not award duplicate achievements or badges', async () => {
      const userId = 'user-1';
      const projectId = 'proj-1';
      mockPrismaService.project.findUnique.mockResolvedValue({ id: projectId, budget: 15000 });
      mockPrismaService.project.count.mockResolvedValue(1); 
      
      // Already awarded!
      mockPrismaService.userAchievement.findUnique.mockResolvedValue({ id: 'exists' });
      mockPrismaService.userBadge.findUnique.mockResolvedValue({ id: 'exists' });

      await service.checkAchievementsAndBadges(userId, projectId);

      // Should skip creation
      expect(mockPrismaService.userAchievement.create).not.toHaveBeenCalled();
      expect(mockPrismaService.userBadge.create).not.toHaveBeenCalled();
    });
  });
});