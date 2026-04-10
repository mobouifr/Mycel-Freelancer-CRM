import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  // Custom metrics
  public readonly httpRequestsTotal: Counter;
  public readonly httpRequestDuration: Histogram;

  constructor() {
    this.registry = new Registry();

    // Default Node.js metrics (CPU, memory, event loop, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Total HTTP requests counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Metrics are ready when the module initializes
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
