import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class GlobalMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const method = req.method ?? 'UNKNOWN';
    const route =
      req.route?.path ?? req.originalUrl?.split('?')[0] ?? req.url ?? 'unknown';
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsedSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      const statusCode = String(res.statusCode ?? 500);

      this.metricsService.httpRequestsTotal.labels(method, route, statusCode).inc();
      this.metricsService.httpRequestDuration
        .labels(method, route, statusCode)
        .observe(elapsedSeconds);

      if ((res.statusCode ?? 500) >= 400) {
        this.metricsService.httpErrorsTotal.labels(method, route, statusCode).inc();
      }
    });

    next();
  }
}