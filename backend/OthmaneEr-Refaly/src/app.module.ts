import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [AuthModule, CustomersModule, ProjectsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}