import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ProjectsModule } from './projects/projects.module';
import { GamificationModule } from './gamification/gamification.module';
import { PrismaModule} from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '../../.env', // Pointing to the root .env
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: configService.get<string>('DATABASE_URL'), // Uses the URL from .env
    //     autoLoadEntities: true, // FOr this one it will load my "Othmane" and your "zouita" entitys, just we need to make sure our entitys are the same.
    //     synchronize: true, // I used this for  development. I might change it later to false and use migrations for production.
    //   }),
    // }),
//! this functions are for Typeorm which we are not using now, maybe we can go back to it ????

    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    ProjectsModule,
    GamificationModule,
  ],
})
export class AppModule {}
