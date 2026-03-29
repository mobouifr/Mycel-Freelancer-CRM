
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // added for gamification to access user data
import { User } from './user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController], // added for gamification to access user data
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
