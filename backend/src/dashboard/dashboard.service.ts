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
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, client: { select: { name: true } }, updatedAt: true },
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
        title: `New Client: ${c.name}`,
        detail: `Joined on ${new Date(c.createdAt).toLocaleDateString()}`,
        timestamp: c.createdAt.getTime(),
      })),
      ...recentProjects.map(p => ({
        id: `project-${p.id}`,
        type: 'project',
        title: p.title, // Actually using the project name!
        detail: `Status: ${p.status.toLowerCase()} • Client: ${p.client.name}`,
        timestamp: p.updatedAt.getTime(),
      })),
      ...recentAchievements.map(a => ({
        id: `achieve-${a.id}`,
        type: 'note', 
        title: `Achievement: ${a.name}`,
        detail: `Unlocked!`,
        timestamp: a.earnedAt.getTime(),
      })),
    ];

    // Sort combined feed by timestamp descending, pick top 5
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    return activities.slice(0, 5).map(act => {
      // Calculate exact time dynamically
      const diffMs = Date.now() - act.timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMins / 60);
      const diffD = Math.floor(diffH / 24);

      let timeString = 'Just now';
      if (diffMins > 0 && diffH === 0) timeString = `${diffMins}m ago`;
      else if (diffH > 0 && diffD === 0) timeString = `${diffH}h ago`;
      else if (diffD === 1) timeString = `Yesterday`;
      else if (diffD > 1) timeString = `${diffD}d ago`;
      
      return {
        id: act.id,
        type: act.type,
        title: act.title,
        detail: act.detail,
        time: timeString,
      }
    });
  }

  async getNotes(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Let's limit dashboards to the last 20 notes
    });
  }

  async createNote(userId: string, title: string, content: string, tags: string[]) {
    return this.prisma.note.create({
      data: {
        title,
        content,
        tags,
        userId,
      }
    });
  }

  async deleteNote(userId: string,  noteId: string) {
    return this.prisma.note.deleteMany({
      where: {
        id: noteId,
        userId: userId // Security: ensuring user owns the note!
      }
    });
  }
}
