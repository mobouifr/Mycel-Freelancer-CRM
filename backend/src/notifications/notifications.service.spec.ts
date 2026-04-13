import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';

// ── Mock factory (recreated before each test) ────────────────────────────────
const createMockPrisma = () => ({
  globalMutation$: new Subject<{ model: string; action: string }>(),
  notification: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findFirst:  jest.fn(),
    count:      jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
    delete:     jest.fn(),
    deleteMany: jest.fn(),
  },
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    // Complete the Subject so no subscriptions leak between parallel workers
    prisma.globalMutation$.complete();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── streamRealTimeUpdates ────────────────────────────────────────────────
  describe('streamRealTimeUpdates', () => {
    it('should emit only Notification model mutations', () => {
      const stream = service.streamRealTimeUpdates();
      const received: any[] = [];

      const sub = stream.subscribe((event) => {
        received.push(JSON.parse(event.data as string));
      });

      // Emit a Notification mutation → should pass through
      prisma.globalMutation$.next({ model: 'Notification', action: 'create' });
      // Emit a Project mutation → should be filtered out
      prisma.globalMutation$.next({ model: 'Project', action: 'create' });

      sub.unsubscribe();
      expect(received).toHaveLength(1);
      expect(received[0].refresh).toBeDefined();
      expect(received[0].model).toBe('Notification');
    });
  });

  // ── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create and return a notification', async () => {
      const dto = { message: 'Test message', type: 'success', title: 'Test' };
      const created = { id: 'n1', userId: 'u1', ...dto, read: false, createdAt: new Date() };
      prisma.notification.create.mockResolvedValue(created);

      const result = await service.create('u1', dto as any);

      expect(result).toEqual(created);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          message: dto.message,
          title: dto.title,
          type: dto.type,
          targetType: undefined,
          targetId: undefined,
        },
      });
    });

    it('should default type to "info" when not provided', async () => {
      const dto = { message: 'Hello' };
      prisma.notification.create.mockResolvedValue({ id: 'n2', type: 'info' });

      await service.create('u1', dto as any);

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'info' }),
        }),
      );
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all notifications for a user (no cursor)', async () => {
      const notifications = [{ id: '1', userId: 'user1', read: false }];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll('user1');

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should apply cursor pagination when cursor is provided', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findAll('user1', 10, 'cursor-id');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 1,
        cursor: { id: 'cursor-id' },
      });
    });
  });

  // ── countUnread ──────────────────────────────────────────────────────────
  describe('countUnread', () => {
    it('should return the number of unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.countUnread('u1');

      expect(result).toBe(3);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'u1', read: false },
      });
    });
  });

  // ── markAsRead ───────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.findFirst.mockResolvedValue({ id: '1', userId: 'u1' });
      prisma.notification.update.mockResolvedValue({ id: '1', read: true });

      const result = await service.markAsRead('u1', '1');

      expect(result.read).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { read: true },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead('u1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if notification belongs to another user', async () => {
      // findFirst with userId check returns null for wrong user
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead('other-user', '1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── markAllAsRead ────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('should return success after marking all as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('u1');

      expect(result.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', read: false },
        data: { read: true },
      });
    });

    it('should return success even when no notifications were unread', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead('u1');

      expect(result.success).toBe(true);
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('should delete a notification by id', async () => {
      const notification = { id: 'n1', userId: 'u1' };
      prisma.notification.findFirst.mockResolvedValue(notification);
      prisma.notification.delete.mockResolvedValue(notification);

      const result = await service.delete('u1', 'n1');

      expect(result).toEqual(notification);
      expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: 'n1' } });
    });

    it('should throw NotFoundException if notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.delete('u1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteAll ────────────────────────────────────────────────────────────
  describe('deleteAll', () => {
    it('should delete all notifications for a user and return count', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 7 });

      const result = await service.deleteAll('u1');

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(7);
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });

    it('should return deleted: 0 when no notifications exist', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.deleteAll('u1');

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(0);
    });
  });
});
