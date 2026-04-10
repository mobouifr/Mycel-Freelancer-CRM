import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('revenue')
  async getRevenue(
    @Req() req: any, 
    @Query('timeframe') timeframe: 'monthly' | 'weekly'
  ) {
    const userId = req.user.id;
    return this.dashboardService.getRevenueData(userId, timeframe || 'monthly');
  }
}