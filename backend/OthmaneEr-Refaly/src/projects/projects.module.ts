import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { GamificationModule } from '../gamification/gamification.module'; // 1. Add this import

@Module({
  imports: [GamificationModule], // 2. Add it to the imports array
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}