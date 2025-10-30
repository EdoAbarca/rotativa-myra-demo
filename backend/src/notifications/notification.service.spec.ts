import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationPreference } from './schemas/notification-preference.schema';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockPreference = {
    user_id: 'hr_admin',
    email_enabled: true,
    in_app_enabled: true,
    email_address: 'hr@company.com',
    notification_types: ['absence', 'late'],
  };

  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(NotificationPreference.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return user preferences if they exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPreference),
      });

      const result = await service.getPreferences('hr_admin');
      expect(result).toEqual(mockPreference);
      expect(mockModel.findOne).toHaveBeenCalledWith({ user_id: 'hr_admin' });
    });

    it('should return null if preferences do not exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getPreferences('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getOrCreatePreferences', () => {
    it('should return existing preferences if they exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPreference),
      });

      const result = await service.getOrCreatePreferences('hr_admin');
      expect(result).toEqual(mockPreference);
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('should create default preferences if they do not exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const newPreference = {
        user_id: 'new_user',
        email_enabled: true,
        in_app_enabled: true,
        notification_types: ['absence', 'late'],
      };

      mockModel.create.mockResolvedValue(newPreference);

      const result = await service.getOrCreatePreferences('new_user');
      expect(result).toEqual(newPreference);
      expect(mockModel.create).toHaveBeenCalledWith({
        user_id: 'new_user',
        email_enabled: true,
        in_app_enabled: true,
        notification_types: ['absence', 'late'],
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const existingPreference = {
        ...mockPreference,
        save: jest.fn().mockResolvedValue({
          ...mockPreference,
          email_enabled: false,
        }),
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingPreference),
      });

      const result = await service.updatePreferences('hr_admin', {
        email_enabled: false,
      });

      expect(existingPreference.save).toHaveBeenCalled();
      expect(result.email_enabled).toBe(false);
    });
  });

  describe('sendNotification', () => {
    it('should send notifications through enabled channels', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPreference),
      });

      const payload = {
        employee_id: 'EMP001',
        employee_name: 'John Doe',
        absence_date: '2025-01-15',
        absence_type: 'absence',
        message: 'Employee John Doe has an unexcused absence',
      };

      const result = await service.sendNotification('hr_admin', payload);

      expect(result.email_sent).toBe(true);
      expect(result.in_app_sent).toBe(true);
    });

    it('should not send notification if type is not enabled', async () => {
      const restrictedPreference = {
        ...mockPreference,
        notification_types: ['late'], // only late, not absence
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(restrictedPreference),
      });

      const payload = {
        employee_id: 'EMP001',
        employee_name: 'John Doe',
        absence_date: '2025-01-15',
        absence_type: 'overtime',
        message: 'Employee has overtime',
      };

      const result = await service.sendNotification('hr_admin', payload);

      expect(result.email_sent).toBe(false);
      expect(result.in_app_sent).toBe(false);
    });
  });

  describe('notifyAbsence', () => {
    it('should notify all HR users about an absence', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPreference),
      });

      await service.notifyAbsence('EMP001', 'John Doe', '2025-01-15', 'Absent');

      expect(mockModel.findOne).toHaveBeenCalled();
    });
  });
});
