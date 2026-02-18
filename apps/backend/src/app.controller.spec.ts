import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

// Helper: mock Express Response object
function mockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

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
        it('should return 200 with status ok when DB is reachable', async () => {
            const res = mockResponse();
            await appController.checkHealth(res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'ok',
                    services: { backend: 'online', database: 'online' },
                }),
            );
        });

        it('should return 503 with status error when DB is unreachable', async () => {
            jest.spyOn(prismaService, '$queryRaw').mockRejectedValueOnce(new Error('ECONNREFUSED'));
            const res = mockResponse();
            await appController.checkHealth(res);

            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    services: { backend: 'online', database: 'offline' },
                }),
            );
        });
    });
});
