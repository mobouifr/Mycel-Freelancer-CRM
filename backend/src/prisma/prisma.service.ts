import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Subject } from 'rxjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public globalMutation$ = new Subject<{ model: string, action: string }>();

  async onModuleInit() {
    await this.$connect();

    // Prisma 5 middleware to catch all database mutations for Real-Time SSE
    this.$use(async (params, next) => {
      const result = await next(params);
      const isMutation = [
        'create', 'update', 'delete', 'upsert', 
        'createMany', 'updateMany', 'deleteMany'
      ].includes(params.action);
      
      if (isMutation && params.model) {
        this.globalMutation$.next({
          model: params.model,
          action: params.action
        });
      }
      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.globalMutation$.complete();
  }
}
