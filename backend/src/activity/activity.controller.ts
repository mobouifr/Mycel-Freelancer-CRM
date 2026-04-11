import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('feed')
  getFeed(
    @Request() req: any, 
    @Query('limit') limit?: string,
    @Query('type') type?: 'client' | 'project'
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.activityService.getActivityFeed(req.user.id || req.user.sub, parsedLimit, type);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.activityService.getDashboardStats(req.user.id || req.user.sub);
  }
}
