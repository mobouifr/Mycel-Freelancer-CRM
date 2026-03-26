
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // added for gamification to access user data

@Module({
    controllers: [UsersController], // added for gamification to access user data
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
