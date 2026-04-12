import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: true,
        badges: true,
      },
    });

    if (!user) {
      return null;
    }

    const xpToNextLevel = Math.max(0, (500 * user.level * user.level) - user.xp);

    return {
      xp: user.xp,
      level: user.level,
      xpToNextLevel,
      achievements: user.achievements,
      badges: user.badges,
    };
  }
}
