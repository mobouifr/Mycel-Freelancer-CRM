import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ProjectsModule } from './projects/projects.module';
import { GamificationModule } from './gamification/gamification.module';

@Module({
  imports: [AuthModule, CustomersModule, ProjectsModule, GamificationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}