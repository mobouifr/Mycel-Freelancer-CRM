import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class AppController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async checkHealth() {
        try {
            // Simple query to check DB connection
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    backend: 'online',
                    database: 'online',
                },
            };
        } catch (error) {
            return {
                status: 'error',
                services: {
                    backend: 'online',
                    database: 'offline',
                },
            };
        }
    }
}
