import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueData(userId: string, timeframe: 'monthly' | 'weekly' = 'monthly') {
    // 1. Fetch all completed projects for this user
    const projects = await this.prisma.project.findMany({
      where: {
        userId: userId,
        status: ProjectStatus.COMPLETED,
      },
      select: {
        budget: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Arrays for chart
    const monthlyRevenue = new Array(12).fill(0);
    const weeklyRevenue = new Array(7).fill(0); // Optional for later
    
    let currentRevenue = 0;
    let previousRevenue = 0;

    // We will parse all returned budgets and categorize them by month
    projects.forEach(project => {
      const pDate = new Date(project.createdAt);
      const pYear = pDate.getFullYear();
      const pMonth = pDate.getMonth();
      const val = project.budget ? Number(project.budget) : 0;

      if (timeframe === 'monthly' && pYear === currentYear) {
        monthlyRevenue[pMonth] += val;
      }

      // For KPI: Calculate exactly current month vs previous month
      if (pYear === currentYear && pMonth === currentMonth) {
        currentRevenue += val;
      } else if (
        (pYear === currentYear && pMonth === currentMonth - 1) ||
        (pMonth === 11 && currentMonth === 0 && pYear === currentYear - 1)
      ) {
        previousRevenue += val; // Last month logic
      }
    });

    // Formatting for Frontend Widget
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      chartData: monthlyRevenue,
      labels,
      currentRevenue,
      previousRevenue,
      projectsDone: projects.length
    };
  }

  async getActivityFeed(userId: string) {
    // Fetch recent items from different tables
    const [recentClients, recentProjects, recentAchievements] = await Promise.all([
      this.prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      this.prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, client: { select: { name: true } }, createdAt: true },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
        take: 5,
        select: { id: true, name: true, type: true, earnedAt: true },
      }),
    ]);

    // Map to a unified Activity interface
    const activities = [
      ...recentClients.map(c => ({
        id: `client-${c.id}`,
        type: 'client',
        title: `activity.new_client_added`, // Will be localized in frontend
        detail: c.name,
        timestamp: c.createdAt.getTime(),
      })),
      ...recentProjects.map(p => ({
        id: `project-${p.id}`,
        type: 'project',
        title: p.status === 'COMPLETED' ? 'activity.project_completed' : 'activity.project_created',
        detail: `${p.title} (${p.client.name})`,
        timestamp: p.createdAt.getTime(),
      })),
      ...recentAchievements.map(a => ({
        id: `achieve-${a.id}`,
        type: 'note', // Using note icon for achievements as placeholder
        title: `Achievement Unlocked!`,
        detail: a.name,
        timestamp: a.earnedAt.getTime(),
      })),
    ];

    // Sort combined feed by timestamp descending, pick top 5
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    // We format the time slightly here but the frontend currently uses translation keys.
    // For now we will return the direct strings for ease.
    return activities.slice(0, 5).map(act => {
      // Format a simple time ago string. Realistically, we'd send ISO date and do it in JS
      const hoursAgo = Math.floor((Date.now() - act.timestamp) / (1000 * 60 * 60));
      let timeKey = 'activity.time_recently';
      if (hoursAgo > 0 && hoursAgo < 24) timeKey = `${hoursAgo}h ago`;
      else if (hoursAgo >= 24 && hoursAgo < 48) timeKey = `Yesterday`;
      else if (hoursAgo >= 48) timeKey = `${Math.floor(hoursAgo / 24)}d ago`;
      
      return {
        id: act.id,
        type: act.type,
        titleKey: act.title,
        detail: act.detail,
        timeKey: timeKey,
      }
    });
  }
}
