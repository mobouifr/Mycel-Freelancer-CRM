import { Controller, Get, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * SECURITY FIX: Return proper HTTP status codes so load balancers
     * and Docker healthchecks can distinguish healthy from unhealthy.
     *   200 → all services up
     *   503 → database unreachable
     */
    @Get()
    async checkHealth(@Res() res: Response) {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    backend: 'online',
                    database: 'online',
                },
            });
        } catch (error) {
            this.logger.error('Health check failed — database unreachable', error);
            return res.status(503).json({
                status: 'error',
                timestamp: new Date().toISOString(),
                services: {
                    backend: 'online',
                    database: 'offline',
                },
                message: 'Database connection failed',
            });
        }
    }
}
