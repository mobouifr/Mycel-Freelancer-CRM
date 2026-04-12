import { Injectable, MessageEvent } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  streamRealTimeUpdates(): Observable<MessageEvent> {
    return this.prisma.globalMutation$.pipe(
      map((mutation) => ({
        data: JSON.stringify({ refresh: Date.now(), ...mutation }),
      } as MessageEvent))
    );
  }

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

  async getActivityHeatmap(userId: string, days: number = 365) {
    const data: Record<string, number> = {};
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    // 1. Count created clients
    const clients = await this.prisma.client.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true }
    });

    // 2. Count created projects
    const createdProjects = await this.prisma.project.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true }
    });

    // 3. Count completed projects (using updatedAt as a proxy for completion date)
    const completedProjects = await this.prisma.project.findMany({
      where: { userId, status: ProjectStatus.COMPLETED, updatedAt: { gte: startDate } },
      select: { updatedAt: true }
    });

    // Helper to increment counts by date
    const incrementDate = (date: Date) => {
      const key = date.toISOString().slice(0, 10);
      data[key] = (data[key] || 0) + 1;
    };

    clients.forEach(c => incrementDate(c.createdAt));
    createdProjects.forEach(p => incrementDate(p.createdAt));
    completedProjects.forEach(p => incrementDate(p.updatedAt));

    return data;
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
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
    });
  }

  async createNote(userId: string, title: string, content: string, tags: string[], color?: string, pinned?: boolean) {
    return this.prisma.note.create({
      data: {
        title,
        content,
        tags,
        color: color || 'default',
        pinned: pinned || false,
        userId,
      }
    });
  }

  async updateNote(userId: string, noteId: string, title: string, content: string, tags: string[], color?: string, pinned?: boolean) {
    return this.prisma.note.updateMany({
      where: {
        id: noteId,
        userId: userId,
      },
      data: {
        title,
        content,
        tags,
        ...(color !== undefined && { color }),
        ...(pinned !== undefined && { pinned }),
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

  // --- EVENTS ---
  async getEvents(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { date: 'asc' }, // usually you want upcoming events first
    });
  }

  async createEvent(userId: string, data: any) {
    return this.prisma.event.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time,
        endDate: data.endDate,
        endTime: data.endTime,
        description: data.description,
        eventType: data.eventType,
        priority: data.priority,
        location: data.location,
        externalLink: data.externalLink,
        projectTag: data.projectTag,
        clientTag: data.clientTag,
        userId,
      }
    });
  }

  // Note: similar to Notes, we use updateMany to verify userId securely
  async updateEvent(userId: string, eventId: string, data: any) {
    await this.prisma.event.updateMany({
      where: {
        id: eventId,
        userId: userId,
      },
      data: {
        title: data.title,
        date: data.date,
        time: data.time,
        endDate: data.endDate,
        endTime: data.endTime,
        description: data.description,
        eventType: data.eventType,
        priority: data.priority,
        location: data.location,
        externalLink: data.externalLink,
        projectTag: data.projectTag,
        clientTag: data.clientTag,
      }
    });
    // return the actual updated record securely
    return this.prisma.event.findFirst({ where: { id: eventId, userId } });
  }

  async deleteEvent(userId: string, eventId: string) {
    return this.prisma.event.deleteMany({
      where: {
        id: eventId,
        userId: userId
      }
    });
  }

  async getProjectsClientsGraph(userId: string) {
    // Get the last 6 months of data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch projects and clients created in the last 6 months
    const [projects, clients] = await Promise.all([
      this.prisma.project.findMany({
        where: { userId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      }),
      this.prisma.client.findMany({
        where: { userId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      })
    ]);

    // Initialize arrays for the last 6 months
    const months = [];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const projectsCounts = new Array(6).fill(0);
    const clientsCounts = new Array(6).fill(0);

    // Build month labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      months.push(monthLabels[d.getMonth()]);
    }

    // Count projects and clients by month
    projects.forEach(p => {
      const pDate = new Date(p.createdAt);
      const monthDiff = (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth());
      const idx = 5 - monthDiff;
      if (idx >= 0 && idx < 6) projectsCounts[idx]++;
    });

    clients.forEach(c => {
      const cDate = new Date(c.createdAt);
      const monthDiff = (now.getFullYear() - cDate.getFullYear()) * 12 + (now.getMonth() - cDate.getMonth());
      const idx = 5 - monthDiff;
      if (idx >= 0 && idx < 6) clientsCounts[idx]++;
    });

    return {
      months,
      projects: projectsCounts,
      clients: clientsCounts
    };
  }
}
