import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    findAll: jest.fn(),
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Bypass guard for unit testing controller logic
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('GET /notifications should call service.findAll', async () => {
    await controller.findAll(mockRequest);
    expect(service.findAll).toHaveBeenCalledWith('user-123');
  });

  it('PATCH /notifications/read-all should call service.markAllAsRead', async () => {
    await controller.markAllAsRead(mockRequest);
    expect(service.markAllAsRead).toHaveBeenCalledWith('user-123');
  });

  it('DELETE /notifications/:id should call service.delete', async () => {
    await controller.delete(mockRequest, 'notif-1');
    expect(service.delete).toHaveBeenCalledWith('user-123', 'notif-1');
  });
});