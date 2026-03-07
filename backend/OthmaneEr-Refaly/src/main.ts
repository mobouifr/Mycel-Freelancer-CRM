import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersModule } from './users/users.module';
import { ValidationPipe } from '@nestjs/common'; // i did this one in order to
//tell the nestjs look at the validation rules on every single incoming request.
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.listen(3000);
    }
bootstrap();


//testing the typescript language

// let helloworld = "Hello, World!";
// helloworld = 15; // This will cause a type error
// helloworld = "Hello, TypeScript!"; // Correct usage