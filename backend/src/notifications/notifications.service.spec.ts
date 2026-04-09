import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  notification: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications for a user', async () => {
      const result = [{ id: '1', userId: 'user1', read: false }];
      mockPrismaService.notification.findMany.mockResolvedValue(result);

      expect(await service.findAll('user1')).toEqual(result);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('markAsRead', () => {
    it('should update a notification as read', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue({ id: '1', userId: 'u1' });
      mockPrismaService.notification.update.mockResolvedValue({ id: '1', read: true });

      const result = await service.markAsRead('u1', '1');
      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);
      await expect(service.markAsRead('u1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should return success after updating many', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });
      const result = await service.markAllAsRead('u1');
      expect(result.success).toBe(true);
    });
  });
});