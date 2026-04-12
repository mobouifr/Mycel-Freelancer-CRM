import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // XP needed to *reach* a given level (cumulative RPG curve)
  // Example: L1 -> 0, L2 -> 500, L3 -> 2000, L4 -> 4500, ...
  private getLevelFromXp(totalXp: number): number {
    const xpForLevel = (level: number) => 500 * level * level; // slower quadratic growth so you don't level too fast

    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }

    return level;
  }

  async awardProjectCompletionXp(userId: string, budget: number, priority: string) {
    const baseXP = 500;

    let multiplier = 1.0;
    switch (priority) {
      case 'low':
        multiplier = 0.5; 
        break;
      case 'medium':
        multiplier = 0.8; 
        break;
      case 'high':
        multiplier = 1.1; 
        break;
    }

    // Level XP is now scaled strictly according to priority, not budget.
    const xpAwarded = Math.floor(baseXP * multiplier);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const previousLevel = user.level;
    const newTotalXp = user.xp + xpAwarded;

    // level is now based on a non‑linear XP curve
    const newLevel = this.getLevelFromXp(newTotalXp);
    const leveledUp = newLevel > previousLevel;

    if (leveledUp) {
      this.logger.log(`🎉 User ${userId} leveled up to Level ${newLevel}!`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
      },
    });

    return {
      xpAwarded,
      newTotalXp,
      previousLevel,
      newLevel,
      leveledUp,
    };
  }

  async checkAchievementsAndBadges(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return;

    const completedProjects = await this.prisma.project.count({
      where: { userId, status: 'COMPLETED' },
    });

    // Achievement 1: First Project
    if (completedProjects === 1) {
      await this.awardAchievement(userId, 'FIRST_PROJECT', 'First Project Completed');
    }

    // Achievement 2: 3 Projects with same client
    if (project.clientId) {
      const clientProjectCount = await this.prisma.project.count({
        where: { userId, clientId: project.clientId, status: 'COMPLETED' },
      });
      if (clientProjectCount === 3) {
        await this.awardAchievement(userId, 'LOYAL_CLIENT_3', 'Loyalty: 3 Projects with a Client');
      }
    }

    // Badge 1: High Roller (Budget > $10,000)
    if (Number(project.budget) > 10000) {
      await this.awardBadge(userId, 'HIGH_ROLLER', 'High Roller');
    }

    // Badge 2: Early Bird (Completed before deadline)
    if (project.deadline && new Date() < new Date(project.deadline)) {
      await this.awardBadge(userId, 'EARLY_BIRD', 'Early Bird');
    }
  }

  private async awardAchievement(userId: string, type: string, name: string) {
    const exists = await this.prisma.userAchievement.findUnique({ where: { userId_type: { userId, type } }});
    if (!exists) {
      await this.prisma.userAchievement.create({ data: { userId, type, name } });
      this.notificationsService.create(userId, {
        title: 'Achievement Unlocked',
        message: `🏆 Achievement Unlocked: ${name}`,
        type: 'achievement',
      }).catch(() => {});
      this.logger.log(`User ${userId} earned achievement: ${name}`);
    }
  }

  private async awardBadge(userId: string, type: string, name: string) {
    const exists = await this.prisma.userBadge.findUnique({ where: { userId_type: { userId, type } }});
    if (!exists) {
      await this.prisma.userBadge.create({ data: { userId, type, name } });
      this.notificationsService.create(userId, {
        title: 'Badge Earned',
        message: `🏅 Badge Earned: ${name}`,
        type: 'badge',
      }).catch(() => {});
      this.logger.log(`User ${userId} earned badge: ${name}`);
    }
  }
}