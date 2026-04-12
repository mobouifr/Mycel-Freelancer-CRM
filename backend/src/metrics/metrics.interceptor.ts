import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      method?: string;
      route?: { path?: string };
      originalUrl?: string;
      url?: string;
    }>();
    const response = http.getResponse<{ statusCode?: number }>();

    const method = request.method ?? 'UNKNOWN';
    const route =
      request.route?.path ??
      request.originalUrl?.split('?')[0] ??
      request.url ??
      'unknown';
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const elapsedSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const statusCode = String(response.statusCode ?? 500);

        this.metricsService.httpRequestsTotal.labels(method, route, statusCode).inc();
        this.metricsService.httpRequestDuration
          .labels(method, route, statusCode)
          .observe(elapsedSeconds);

        if ((response.statusCode ?? 500) >= 400) {
          this.metricsService.httpErrorsTotal
            .labels(method, route, statusCode)
            .inc();
        }
      }),
    );
  }
}