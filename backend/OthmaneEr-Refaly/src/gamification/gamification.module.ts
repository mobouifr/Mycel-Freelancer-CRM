import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Replace UsersModule with PrismaModule
  providers: [GamificationService],
  exports: [GamificationService], // Makes the XP logic available to Projects
})
export class GamificationModule {}