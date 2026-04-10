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

  it('should award base XP and level up from Level 1 to Level 2', async () => {
    const userId = 'user-uuid-1';
    // Arrange: Mock a brand new user with 0 XP
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 0, level: 1 });
    mockPrismaService.user.update.mockResolvedValue({});

    // Act: Complete a 'medium' priority project
    // 500 base XP * 0.8 multiplier = 400 XP total.
    const result = await service.awardProjectCompletionXp(userId, 0, 'medium');

    // Assert: Check the math
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result.xpAwarded).toBe(400);
    expect(result.newTotalXp).toBe(400);
    expect(result.newLevel).toBe(1); // 400 XP means Level 1 (needs 500 for Level 2)
    expect(result.leveledUp).toBe(false);
    
    // Ensure it sent the right save command to the database
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { xp: 400, level: 1 },
    });
  });

  it('should apply urgent multipliers and safely level up', async () => {
    const userId = 'user-uuid-2';
    // Arrange: Mock a brand new user
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 0, level: 1 });
    mockPrismaService.user.update.mockResolvedValue({});

    // Act: Complete an 'urgent' project with a $5000 budget
    // (500 base XP * 1.5 multiplier) = 750 XP.
    const result = await service.awardProjectCompletionXp(userId, 5000, 'urgent');

    // Assert: Check the math
    expect(result.xpAwarded).toBe(750);
    expect(result.newLevel).toBe(2); // 750 XP means Level 2 (needs 2000 for Level 3)
    expect(result.leveledUp).toBe(true);
  });

  it('should award XP but NOT level up if the threshold is not met', async () => {
    const userId = 'user-uuid-3';
    // Arrange: Mock a Level 2 user who currently has 1000 XP
    // (They need 2000 XP to reach Level 3)
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 1000, level: 2 });
    mockPrismaService.user.update.mockResolvedValue({});

    // Act: Complete a 'low' priority project
    // 500 base XP * 0.5 multiplier = 250 XP.
    // 1000 + 250 = 1250 total XP.
    const result = await service.awardProjectCompletionXp(userId, 0, 'low');

    // Assert: Check the math
    expect(result.xpAwarded).toBe(250);
    expect(result.newTotalXp).toBe(1250);
    expect(result.newLevel).toBe(2); // 1250 is less than 2000, so they stay Level 2
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
      mockPrismaService.project.count.mockImplementation((args) => {
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