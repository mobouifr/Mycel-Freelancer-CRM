import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // XP needed to *reach* a given level (cumulative curve)
  // Example: L1 -> 0, L2 -> 100, L3 -> 400, L4 -> 900, ...
  private getLevelFromXp(totalXp: number): number {
    const xpForLevel = (level: number) => 100 * level * level; // quadratic growth

    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }

    return level;
  }

  async awardProjectCompletionXp(userId: string, budget: number, priority: string) {
    const baseXP = 250;

    let multiplier = 1.0;
    switch (priority) {
      case 'low':
        multiplier = 0.8;
        break;
      case 'medium':
        multiplier = 1.0;
        break;
      case 'high':
        multiplier = 1.5;
        break;
      case 'urgent':
        multiplier = 2.0;
        break;
    }

    const budgetBonus = Math.floor(budget / 100);
    const xpAwarded = Math.floor(baseXP * multiplier + budgetBonus);

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
      await this.prisma.notification.create({ data: { userId, message: `🏆 Achievement Unlocked: ${name}`, type: 'achievement' } });
      this.logger.log(`User ${userId} earned achievement: ${name}`);
    }
  }

  private async awardBadge(userId: string, type: string, name: string) {
    const exists = await this.prisma.userBadge.findUnique({ where: { userId_type: { userId, type } }});
    if (!exists) {
      await this.prisma.userBadge.create({ data: { userId, type, name } });
      await this.prisma.notification.create({ data: { userId, message: `🏅 Badge Earned: ${name}`, type: 'badge' } });
      this.logger.log(`User ${userId} earned badge: ${name}`);
    }
  }
}