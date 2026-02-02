import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    }
bootstrap();


//testing the typescript language

// let helloworld = "Hello, World!";
// helloworld = 15; // This will cause a type error
// helloworld = "Hello, TypeScript!"; // Correct usage