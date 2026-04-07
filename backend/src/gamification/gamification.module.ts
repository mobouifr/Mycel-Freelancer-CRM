import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Replace UsersModule with PrismaModule
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService], // Makes the XP logic available to Projects
})
export class GamificationModule {}