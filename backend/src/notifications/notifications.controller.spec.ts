import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { MessageEvent } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    streamRealTimeUpdates: jest.fn(),
    findAll: jest.fn(),
    countUnread: jest.fn(),
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
    deleteAll: jest.fn(),
    delete: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-123' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── GET /notifications ───────────────────────────────────────────────────
  describe('findAll', () => {
    it('should call service.findAll with defaults when no query params', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user-123', 50, undefined);
    });

    it('should respect a custom take query param', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockRequest, '20');

      expect(service.findAll).toHaveBeenCalledWith('user-123', 20, undefined);
    });

    it('should cap take at 100', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockRequest, '999');

      expect(service.findAll).toHaveBeenCalledWith('user-123', 100, undefined);
    });

    it('should forward cursor to service', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockRequest, undefined, 'cursor-abc');

      expect(service.findAll).toHaveBeenCalledWith('user-123', 50, 'cursor-abc');
    });
  });

  // ── GET /notifications/unread-count ──────────────────────────────────────
  describe('unreadCount', () => {
    it('should return the unread count wrapped in an object', async () => {
      mockService.countUnread.mockResolvedValue(4);

      const result = await controller.unreadCount(mockRequest);

      expect(result).toEqual({ count: 4 });
      expect(service.countUnread).toHaveBeenCalledWith('user-123');
    });

    it('should return 0 when no unread notifications', async () => {
      mockService.countUnread.mockResolvedValue(0);

      const result = await controller.unreadCount(mockRequest);

      expect(result).toEqual({ count: 0 });
    });
  });

  // ── PATCH /notifications/read-all ────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('should call service.markAllAsRead for the current user', async () => {
      mockService.markAllAsRead.mockResolvedValue({ success: true });

      await controller.markAllAsRead(mockRequest);

      expect(service.markAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  // ── PATCH /notifications/:id/read ────────────────────────────────────────
  describe('markAsRead', () => {
    it('should call service.markAsRead with the correct user and notification id', async () => {
      const notification = { id: 'notif-1', read: true };
      mockService.markAsRead.mockResolvedValue(notification);

      const result = await controller.markAsRead(mockRequest, 'notif-1');

      expect(result).toEqual(notification);
      expect(service.markAsRead).toHaveBeenCalledWith('user-123', 'notif-1');
    });
  });

  // ── DELETE /notifications ────────────────────────────────────────────────
  describe('deleteAll', () => {
    it('should call service.deleteAll for the current user', async () => {
      mockService.deleteAll.mockResolvedValue({ success: true, deleted: 3 });

      await controller.deleteAll(mockRequest);

      expect(service.deleteAll).toHaveBeenCalledWith('user-123');
    });
  });

  // ── DELETE /notifications/:id ────────────────────────────────────────────
  describe('delete', () => {
    it('should call service.delete with the correct user and notification id', async () => {
      mockService.delete.mockResolvedValue({ id: 'notif-1' });

      await controller.delete(mockRequest, 'notif-1');

      expect(service.delete).toHaveBeenCalledWith('user-123', 'notif-1');
    });
  });

  // ── SSE /notifications/realtime ──────────────────────────────────────────
  describe('streamRealTimeUpdates', () => {
    it('should return an observable from the service', () => {
      const subject = new Subject<{ model: string; action: string }>();
      const observable = subject.pipe(
        filter((m) => m.model === 'Notification'),
        map((m) => ({ data: JSON.stringify({ refresh: Date.now(), ...m }) } as MessageEvent)),
      );
      mockService.streamRealTimeUpdates.mockReturnValue(observable);

      const stream = controller.streamRealTimeUpdates();
      const received: MessageEvent[] = [];

      const sub = stream.subscribe((event) => received.push(event));

      subject.next({ model: 'Notification', action: 'create' });

      sub.unsubscribe();
      expect(received).toHaveLength(1);
      const parsed = JSON.parse(received[0].data as string);
      expect(parsed.refresh).toBeDefined();
    });
  });
});
