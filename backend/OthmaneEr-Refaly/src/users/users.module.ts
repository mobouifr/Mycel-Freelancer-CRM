
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // added for gamification to access user data
import { User } from './user.entity';


//?L Controllers dyalk rah txzado UsersController 
// TODO: make sure that they work fine m3a l camification, check it m3a montaasir.

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController], // added for gamification to access user data
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}


