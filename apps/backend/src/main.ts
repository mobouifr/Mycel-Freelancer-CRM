import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix: /api
    app.setGlobalPrefix('api');

    // Enable CORS (supports comma-separated CORS_ORIGINS from .env)
    const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3089')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
