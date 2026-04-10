import { Controller, Get, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limit = take ? Math.min(parseInt(take, 10) || 50, 100) : 50;
    return this.notificationsService.findAll(req.user.id || req.user.sub, limit, cursor);
  }

  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    const count = await this.notificationsService.countUnread(req.user.id || req.user.sub);
    return { count };
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id || req.user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id || req.user.sub, id);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.delete(req.user.id || req.user.sub, id);
  }
}
