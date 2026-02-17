import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
    let appController: AppController;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: PrismaService,
                    useValue: {
                        $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
                    },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
        prismaService = app.get<PrismaService>(PrismaService);
    });

    describe('checkHealth', () => {
        it('should return status ok', async () => {
            const result = await appController.checkHealth();
            expect(result.status).toBe('ok');
            expect(result.services.backend).toBe('online');
            expect(result.services.database).toBe('online');
        });
    });
});
