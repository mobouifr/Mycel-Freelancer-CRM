import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.listen(3000);
    }
bootstrap();


//testing the typescript language

// let helloworld = "Hello, World!";
// helloworld = 15; // This will cause a type error
// helloworld = "Hello, TypeScript!"; // Correct usage