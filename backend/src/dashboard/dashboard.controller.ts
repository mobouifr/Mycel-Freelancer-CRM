import { Controller, Get, Req, Query, UseGuards, Post, Body, Delete, Param, Put } from '@nestjs/common';
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

  @Get('activity')
  async getActivityFeed(@Req() req: any) {
    return this.dashboardService.getActivityFeed(req.user.id);
  }

  @Get('activity-heatmap')
  async getActivityHeatmap(@Req() req: any, @Query('days') days?: string) {
    const daysCount = parseInt(days || '365', 10);
    return this.dashboardService.getActivityHeatmap(req.user.id, daysCount);
  }

  // Note endpoints directly inside Dashboard Controller for simplicity as per Option A
  @Get('notes')
  async getNotes(@Req() req: any) {
    return this.dashboardService.getNotes(req.user.id);
  }

  @Post('notes')
  async createNote(@Req() req: any, @Body() body: { title: string; content: string; tags: string[]; color?: string; pinned?: boolean }) {
    return this.dashboardService.createNote(req.user.id, body.title, body.content, body.tags || [], body.color, body.pinned);
  }

  @Put('notes/:id')
  async updateNote(@Req() req: any, @Param('id') id: string, @Body() body: { title: string; content: string; tags: string[]; color?: string; pinned?: boolean }) {
    return this.dashboardService.updateNote(req.user.id, id, body.title, body.content, body.tags || [], body.color, body.pinned);
  }

  @Delete('notes/:id')
  async deleteNote(@Req() req: any, @Param('id') id: string) {
    return this.dashboardService.deleteNote(req.user.id, id);
  }

  @Get('events')
  async getEvents(@Req() req: any) {
    return this.dashboardService.getEvents(req.user.id);
  }

  @Post('events')
  async createEvent(@Req() req: any, @Body() body: any) {
    return this.dashboardService.createEvent(req.user.id, body);
  }

  @Put('events/:id')
  async updateEvent(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.dashboardService.updateEvent(req.user.id, id, body);
  }

  @Delete('events/:id')
  async deleteEvent(@Req() req: any, @Param('id') id: string) {
    return this.dashboardService.deleteEvent(req.user.id, id);
  }

  @Get('projects-clients-graph')
  async getProjectsClientsGraph(@Req() req: any) {
    return this.dashboardService.getProjectsClientsGraph(req.user.id);
  }
}