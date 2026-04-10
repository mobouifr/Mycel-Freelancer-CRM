import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:3089'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.use('/api/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));
    await app.listen(3001);
    }
bootstrap();
