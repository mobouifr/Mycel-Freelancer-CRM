import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
    private readonly register: client.Registry;

    // Custom metrics
    readonly httpRequestDuration: client.Histogram<string>;
    readonly httpRequestsTotal: client.Counter<string>;

    constructor() {
        this.register = new client.Registry();

        // Set default labels
        this.register.setDefaultLabels({ app: 'freelancer-crm-backend' });

        // Collect default Node.js metrics (CPU, memory, event loop, etc.)
        client.collectDefaultMetrics({ register: this.register });

        // HTTP request duration histogram
        this.httpRequestDuration = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.register],
        });

        // HTTP request counter
        this.httpRequestsTotal = new client.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.register],
        });
    }

    onModuleInit() {
        // Metrics are initialized in the constructor
    }

    async getMetrics(): Promise<string> {
        return this.register.metrics();
    }

    getContentType(): string {
        return this.register.contentType;
    }
}
