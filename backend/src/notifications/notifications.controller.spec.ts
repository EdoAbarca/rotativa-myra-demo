import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification.service';
import { AbsenceDetectionService } from './absence-detection.service';
import { LateArrivalDetectionService } from './late-arrival-detection.service';
import { RealtimeNotificationService } from './realtime-notification.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationService = {
    getOrCreatePreferences: jest.fn(),
    updatePreferences: jest.fn(),
    notifyLateArrival: jest.fn(),
  };

  const mockAbsenceDetectionService = {
    detectAbsences: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateAlert: jest.fn(),
    getStatistics: jest.fn(),
  };

  const mockLateArrivalDetectionService = {
    detectLateArrivals: jest.fn(),
  };

  const mockRealtimeNotificationService = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    sendRealTimeNotification: jest.fn(),
    getNotifications: jest.fn(),
    getStatistics: jest.fn(),
    updateNotification: jest.fn(),
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: AbsenceDetectionService,
          useValue: mockAbsenceDetectionService,
        },
        {
          provide: LateArrivalDetectionService,
          useValue: mockLateArrivalDetectionService,
        },
        {
          provide: RealtimeNotificationService,
          useValue: mockRealtimeNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const preferences = {
        user_id: 'hr_admin',
        email_enabled: true,
        in_app_enabled: true,
      };

      mockNotificationService.getOrCreatePreferences.mockResolvedValue(
        preferences,
      );

      const result = await controller.getPreferences('hr_admin');
      expect(result).toEqual(preferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const updated = {
        user_id: 'hr_admin',
        email_enabled: false,
        in_app_enabled: true,
      };

      mockNotificationService.updatePreferences.mockResolvedValue(updated);

      const result = await controller.updatePreferences('hr_admin', {
        email_enabled: false,
      });

      expect(result).toEqual(updated);
    });
  });

  describe('detectAbsences', () => {
    it('should detect absences and return alerts', async () => {
      const alerts = [
        {
          employee_id: 'EMP001',
          absence_date: new Date('2025-01-15'),
          status: 'unexcused',
        },
      ];

      mockAbsenceDetectionService.detectAbsences.mockResolvedValue(alerts);

      const result = await controller.detectAbsences('2025-01-15');

      expect(result.success).toBe(true);
      expect(result.alerts).toEqual(alerts);
      expect(result.message).toContain('1');
    });
  });

  describe('getAbsenceAlerts', () => {
    it('should return absence alerts', async () => {
      const alerts = [
        {
          employee_id: 'EMP001',
          absence_date: new Date('2025-01-15'),
          status: 'unexcused',
        },
      ];

      mockAbsenceDetectionService.findAll.mockResolvedValue(alerts);

      const result = await controller.getAbsenceAlerts({ status: 'unexcused' });
      expect(result).toEqual(alerts);
    });
  });

  describe('getAbsenceAlert', () => {
    it('should return a specific alert', async () => {
      const alert = {
        _id: 'alert123',
        employee_id: 'EMP001',
        status: 'unexcused',
      };

      mockAbsenceDetectionService.findById.mockResolvedValue(alert);

      const result = await controller.getAbsenceAlert('alert123');
      expect(result).toEqual(alert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockAbsenceDetectionService.findById.mockResolvedValue(null);

      await expect(controller.getAbsenceAlert('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAbsenceAlert', () => {
    it('should update an alert', async () => {
      const updated = {
        _id: 'alert123',
        status: 'excused',
        reviewed_by: 'hr_admin',
      };

      mockAbsenceDetectionService.updateAlert.mockResolvedValue(updated);

      const result = await controller.updateAbsenceAlert('alert123', {
        status: 'excused',
        reviewed_by: 'hr_admin',
      });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockAbsenceDetectionService.updateAlert.mockResolvedValue(null);

      await expect(
        controller.updateAbsenceAlert('nonexistent', { status: 'excused' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAbsenceStatistics', () => {
    it('should return statistics', async () => {
      const stats = {
        total: 10,
        unexcused: 3,
        excused: 5,
        pending_review: 2,
        notification_sent_count: 8,
      };

      mockAbsenceDetectionService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getAbsenceStatistics(
        '2025-01-01',
        '2025-01-31',
      );

      expect(result).toEqual(stats);
    });
  });
});
