import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivityFeed(userId: string, limit: number = 10, type?: 'client' | 'project') {
    // We can fetch them, sort them by newest first, and format them for the dashboard.
    const whereClause: any = {
      userId,
      // Focus strictly on generic system activity (clients or projects) 
      // instead of badges or gamification achievements if type is not strictly provided
      NOT: [{ type: 'achievement' }, { type: 'badge' }],
    };

    if (type) {
      whereClause.targetType = type;
    }

    const activities = await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return activities.map(act => ({
      id: act.id,
      title: act.title || 'Activity',
      message: act.message,
      type: act.type, // e.g. success (creation), info (update), warning (deletion)
      targetType: act.targetType, // 'client' or 'project'
      targetId: act.targetId,
      date: act.createdAt,
      read: act.read,
    }));
  }

  async getDashboardStats(userId: string) {
    // Quick summary counts for the dashboard
    const [totalClients, totalProjects, completedProjects, user] = await Promise.all([
      this.prisma.client.count({ where: { userId } }),
      this.prisma.project.count({ where: { userId } }),
      this.prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { level: true, xp: true } })
    ]);

    return {
      totalClients,
      totalProjects,
      completedProjects,
      activeProjects: totalProjects - completedProjects,
      level: user?.level || 1,
      xp: user?.xp || 0
    };
  }
}
