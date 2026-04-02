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
}