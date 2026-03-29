import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
    imports: [PrismaModule, ClientsModule, MetricsModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }
