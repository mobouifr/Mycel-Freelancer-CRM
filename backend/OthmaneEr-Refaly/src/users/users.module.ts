
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { PrismaModule } from '../prisma/prisma.module';


//?L Controllers dyalk rah txzado UsersController 
// TODO: make sure that they work fine m3a l camification, check it m3a montaasir.


//?L Controllers dyalk rah txzado UsersController 
// TODO: make sure that they work fine m3a l camification, check it m3a montaasir.

@Module({
    // imports: [TypeOrmModule.forFeature([User])],
    imports: [PrismaModule],
    controllers: [UsersController], // added for gamification to access user data
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}


