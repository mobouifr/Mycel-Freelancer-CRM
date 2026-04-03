import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrismaService },
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

    // Act: Complete a 'medium' priority project with no budget
    // 250 base XP * 1.0 multiplier + 0 budget bonus = 250 XP total.
    const result = await service.awardProjectCompletionXp(userId, 0, 'medium');

    // Assert: Check the math
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result.xpAwarded).toBe(250);
    expect(result.newTotalXp).toBe(250);
    expect(result.newLevel).toBe(2); // 250 crosses the 100 XP threshold for Level 2
    expect(result.leveledUp).toBe(true);
    
    // Ensure it sent the right save command to the database
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { xp: 250, level: 2 },
    });
  });

  it('should apply urgent multipliers and budget bonuses, jumping multiple levels', async () => {
    const userId = 'user-uuid-2';
    // Arrange: Mock a brand new user
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 0, level: 1 });
    mockPrismaService.user.update.mockResolvedValue({});

    // Act: Complete an 'urgent' project with a $5000 budget
    // (250 * 2.0 multiplier) + (5000 / 100 budget bonus) = 550 XP.
    const result = await service.awardProjectCompletionXp(userId, 5000, 'urgent');

    // Assert: Check the math
    expect(result.xpAwarded).toBe(550);
    expect(result.newLevel).toBe(3); // 550 crosses the 400 XP threshold for Level 3
    expect(result.leveledUp).toBe(true);
  });

  it('should award XP but NOT level up if the threshold is not met', async () => {
    const userId = 'user-uuid-3';
    // Arrange: Mock a Level 3 user who currently has 400 XP
    // (They need 900 XP to reach Level 4)
    mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, xp: 400, level: 3 });
    mockPrismaService.user.update.mockResolvedValue({});

    // Act: Complete a 'low' priority project with no budget
    // 250 base XP * 0.8 multiplier = 200 XP.
    // 400 + 200 = 600 total XP.
    const result = await service.awardProjectCompletionXp(userId, 0, 'low');

    // Assert: Check the math
    expect(result.xpAwarded).toBe(200);
    expect(result.newTotalXp).toBe(600);
    expect(result.newLevel).toBe(3); // 600 is less than 900, so they stay Level 3
    expect(result.leveledUp).toBe(false); 
  });
});