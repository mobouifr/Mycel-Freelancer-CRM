import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // Gives access to UsersService
  providers: [GamificationService],
  exports: [GamificationService], // Makes the XP logic available to Projects
})
export class GamificationModule {}