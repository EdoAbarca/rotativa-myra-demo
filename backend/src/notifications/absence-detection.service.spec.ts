import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AbsenceDetectionService } from './absence-detection.service';
import { AbsenceAlert } from './schemas/absence-alert.schema';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';
import { NotificationService } from './notification.service';

describe('AbsenceDetectionService', () => {
  let service: AbsenceDetectionService;

  const mockAlert = {
    employee_id: 'EMP001',
    absence_date: new Date('2025-01-15'),
    status: 'unexcused',
    notification_sent: false,
    notification_channels: [],
  };

  const mockAttendance = {
    employee_id: 'EMP001',
    date: new Date('2025-01-15'),
    status: 'Absent',
  };

  const mockEmployee = {
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@company.com',
  };

  const mockAttendanceService = {
    findAllPaginated: jest.fn(),
  };

  const mockEmployeesService = {
    findByEmployeeId: jest.fn(),
  };

  const mockNotificationService = {
    notifyAbsence: jest.fn(),
  };

  const mockModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenceDetectionService,
        {
          provide: getModelToken(AbsenceAlert.name),
          useValue: mockModel,
        },
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AbsenceDetectionService>(AbsenceDetectionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectAbsences', () => {
    it('should detect new absences and create alerts', async () => {
      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: [mockAttendance],
        pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      });

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const createdAlert = {
        ...mockAlert,
        save: jest.fn().mockResolvedValue(mockAlert),
      };

      mockModel.create.mockResolvedValue(createdAlert);
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockNotificationService.notifyAbsence.mockResolvedValue(undefined);

      const result = await service.detectAbsences('2025-01-15');

      expect(result).toHaveLength(1);
      expect(mockModel.create).toHaveBeenCalled();
      expect(mockNotificationService.notifyAbsence).toHaveBeenCalledWith(
        'EMP001',
        'John Doe',
        '2025-01-15',
        'Absent',
      );
    });

    it('should not create duplicate alerts', async () => {
      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: [mockAttendance],
        pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      });

      const existingAlert = {
        ...mockAlert,
        notification_sent: true,
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingAlert),
      });

      const result = await service.detectAbsences('2025-01-15');

      expect(result).toHaveLength(0);
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('should resend notifications for unexcused absences without notifications', async () => {
      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: [mockAttendance],
        pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      });

      const existingAlert = {
        ...mockAlert,
        notification_sent: false,
        save: jest
          .fn()
          .mockResolvedValue({ ...mockAlert, notification_sent: true }),
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingAlert),
      });

      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockNotificationService.notifyAbsence.mockResolvedValue(undefined);

      const result = await service.detectAbsences('2025-01-15');

      expect(result).toHaveLength(1);
      expect(mockNotificationService.notifyAbsence).toHaveBeenCalled();
      expect(existingAlert.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all alerts matching query', async () => {
      const alerts = [mockAlert];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(alerts),
        }),
      });

      const result = await service.findAll({ status: 'unexcused' });

      expect(result).toEqual(alerts);
      expect(mockModel.find).toHaveBeenCalledWith({ status: 'unexcused' });
    });

    it('should filter by date range', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll({
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      });

      expect(mockModel.find).toHaveBeenCalledWith({
        absence_date: {
          $gte: new Date('2025-01-01'),
          $lte: new Date('2025-01-31'),
        },
      });
    });
  });

  describe('updateAlert', () => {
    it('should update alert status and set reviewed_at', async () => {
      const alert = {
        ...mockAlert,
        save: jest.fn().mockResolvedValue({
          ...mockAlert,
          status: 'excused',
          reviewed_by: 'hr_admin',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          reviewed_at: expect.any(Date),
        }),
      };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(alert),
      });

      const result = await service.updateAlert('alert123', {
        status: 'excused',
        reviewed_by: 'hr_admin',
      });

      expect(result).toBeDefined();
      expect(alert.save).toHaveBeenCalled();
    });

    it('should return null if alert not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateAlert('nonexistent', {
        status: 'excused',
      });

      expect(result).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for alerts', async () => {
      const alerts = [
        { ...mockAlert, status: 'unexcused', notification_sent: true },
        { ...mockAlert, status: 'excused', notification_sent: true },
        { ...mockAlert, status: 'pending_review', notification_sent: false },
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(alerts),
      });

      const result = await service.getStatistics();

      expect(result.total).toBe(3);
      expect(result.unexcused).toBe(1);
      expect(result.excused).toBe(1);
      expect(result.pending_review).toBe(1);
      expect(result.notification_sent_count).toBe(2);
    });
  });
});
