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
}
