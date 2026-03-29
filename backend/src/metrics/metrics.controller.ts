import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

/**
 * GET /metrics — Prometheus scrape endpoint.
 *
 * This controller is intentionally NOT behind the /api prefix
 * so Prometheus can scrape it at http://backend:3001/metrics.
 *
 * It must be excluded from any JWT auth guards.
 */
@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) {}

    @Get()
    async getMetrics(@Res() res: Response) {
        const metrics = await this.metricsService.getMetrics();
        res.set('Content-Type', this.metricsService.getContentType());
        res.end(metrics);
    }
}
