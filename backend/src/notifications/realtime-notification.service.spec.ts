import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RealtimeNotificationService } from './realtime-notification.service';
import { Notification } from './schemas/notification.schema';

describe('RealtimeNotificationService', () => {
  let service: RealtimeNotificationService;

  const mockNotificationModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeNotificationService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<RealtimeNotificationService>(
      RealtimeNotificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a new stream for a user', (done) => {
      const userId = 'user123';
      const observable = service.subscribe(userId);

      expect(observable).toBeDefined();

      const subscription = observable.subscribe({
        next: () => {},
        error: () => {},
        complete: () => {
          subscription.unsubscribe();
          done();
        },
      });

      service.unsubscribe(userId);
    });

    it('should allow multiple subscriptions for same user', (done) => {
      const userId = 'user123';

      const mockNotification = {
        _id: 'notif123',
        user_id: userId,
        type: 'test',
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date(),
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const stream1 = service.subscribe(userId);
      const stream2 = service.subscribe(userId);

      // Both streams should receive the same notifications
      let count = 0;
      const checkDone = () => {
        count++;
        if (count === 2) {
          service.unsubscribe(userId);
          done();
        }
      };

      stream1.subscribe({ next: checkDone });
      stream2.subscribe({ next: checkDone });

      // Send a test notification
      void service.sendRealTimeNotification(
        userId,
        'test',
        'Test',
        'Test message',
      );
    });
  });

  describe('sendRealTimeNotification', () => {
    it('should create and store a notification', async () => {
      const userId = 'user123';
      const type = 'absence';
      const title = 'Test Notification';
      const message = 'Test message';
      const data = { employee_id: 'EMP001' };

      const mockNotification = {
        _id: 'notif123',
        user_id: userId,
        type,
        title,
        message,
        data,
        severity: 'info',
        read: false,
        createdAt: new Date(),
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const result = await service.sendRealTimeNotification(
        userId,
        type,
        title,
        message,
        data,
      );

      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        user_id: userId,
        type,
        title,
        message,
        data,
        severity: 'info',
        read: false,
      });
      expect(result).toEqual(mockNotification);
    });

    it('should send notification to subscribed user', (done) => {
      const userId = 'user123';
      const type = 'late';
      const title = 'Late Arrival';
      const message = 'Employee arrived late';

      const mockNotification = {
        _id: 'notif123',
        user_id: userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date(),
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const observable = service.subscribe(userId);

      observable.subscribe({
        next: (event) => {
          const payload = JSON.parse(event.data as string) as {
            title: string;
            message: string;
          };
          expect(payload.title).toBe(title);
          expect(payload.message).toBe(message);
          service.unsubscribe(userId);
          done();
        },
      });

      // Send notification after subscription
      setTimeout(() => {
        void service.sendRealTimeNotification(userId, type, title, message);
      }, 10);
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user123';
      const mockNotifications = [
        { _id: '1', user_id: userId, type: 'absence', read: false },
        { _id: '2', user_id: userId, type: 'late', read: true },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotifications),
      };

      mockNotificationModel.find.mockReturnValue(mockQuery);
      mockNotificationModel.countDocuments.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(2) // total
          .mockResolvedValueOnce(1), // unread
      });

      const result = await service.getNotifications(userId, { limit: 50 });

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.total).toBe(2);
      expect(result.unread).toBe(1);
    });

    it('should filter notifications by read status', async () => {
      const userId = 'user123';
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockNotificationModel.find.mockReturnValue(mockQuery);
      mockNotificationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.getNotifications(userId, { read: false });

      expect(mockNotificationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          read: false,
        }),
      );
    });

    it('should filter notifications by type', async () => {
      const userId = 'user123';
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockNotificationModel.find.mockReturnValue(mockQuery);
      mockNotificationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.getNotifications(userId, { type: 'absence' });

      expect(mockNotificationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          type: 'absence',
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 'notif123';
      const userId = 'user123';
      const mockNotification = {
        _id: notificationId,
        user_id: userId,
        read: true,
        read_at: expect.any(Date) as Date,
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockNotification),
      };

      mockNotificationModel.findOneAndUpdate.mockReturnValue(mockQuery);

      const result = await service.markAsRead(notificationId, userId);

      expect(mockNotificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: notificationId, user_id: userId },
        { read: true, read_at: expect.any(Date) as Date },
        { new: true },
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const userId = 'user123';
      const mockResult = {
        modifiedCount: 5,
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }),
      };

      mockNotificationModel.updateMany.mockReturnValue(mockResult);

      const count = await service.markAllAsRead(userId);

      expect(mockNotificationModel.updateMany).toHaveBeenCalledWith(
        { user_id: userId, read: false },
        { read: true, read_at: expect.any(Date) as Date },
      );
      expect(count).toBe(5);
    });
  });

  describe('getStatistics', () => {
    it('should return notification statistics', async () => {
      const userId = 'user123';
      const mockNotifications = [
        { type: 'absence', severity: 'warning', read: false },
        { type: 'absence', severity: 'error', read: true },
        { type: 'late', severity: 'info', read: false },
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockNotifications),
      };

      mockNotificationModel.find.mockReturnValue(mockQuery);

      const stats = await service.getStatistics(userId);

      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.by_type).toEqual({
        absence: 2,
        late: 1,
      });
      expect(stats.by_severity).toEqual({
        warning: 1,
        error: 1,
        info: 1,
      });
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old read notifications', async () => {
      const mockResult = {
        deletedCount: 10,
        exec: jest.fn().mockResolvedValue({ deletedCount: 10 }),
      };

      mockNotificationModel.deleteMany.mockReturnValue(mockResult);

      const count = await service.deleteOldNotifications(90);

      expect(mockNotificationModel.deleteMany).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) as Date },
        read: true,
      });
      expect(count).toBe(10);
    });
  });
});
