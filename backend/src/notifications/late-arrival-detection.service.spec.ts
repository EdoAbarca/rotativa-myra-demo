import { Test, TestingModule } from '@nestjs/testing';
import { LateArrivalDetectionService } from './late-arrival-detection.service';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';

describe('LateArrivalDetectionService', () => {
  let service: LateArrivalDetectionService;

  const mockAttendanceService = {
    findAllPaginated: jest.fn(),
  };

  const mockEmployeesService = {
    findByEmployeeId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LateArrivalDetectionService,
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<LateArrivalDetectionService>(
      LateArrivalDetectionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectLateArrivals', () => {
    it('should detect employees who arrived late', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP001',
            date: testDate,
            status: 'Late',
            check_in_time: '09:30:00',
          },
          {
            employee_id: 'EMP002',
            date: testDate,
            status: 'Present',
            check_in_time: '09:15:00',
          },
        ],
        total: 2,
        page: 1,
        limit: 1000,
      };

      const mockEmployee1 = {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockEmployee2 = {
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );
      mockEmployeesService.findByEmployeeId
        .mockResolvedValueOnce(mockEmployee1)
        .mockResolvedValueOnce(mockEmployee2);

      const result = await service.detectLateArrivals(testDate);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        employee_id: 'EMP001',
        employee_name: 'John Doe',
        date: testDate,
        expected_time: '09:00',
        actual_time: '09:30:00',
        minutes_late: 30,
      });
      expect(result[1]).toEqual({
        employee_id: 'EMP002',
        employee_name: 'Jane Smith',
        date: testDate,
        expected_time: '09:00',
        actual_time: '09:15:00',
        minutes_late: 15,
      });
    });

    it('should not detect employees who arrived on time', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP001',
            date: testDate,
            status: 'Present',
            check_in_time: '08:55:00',
          },
          {
            employee_id: 'EMP002',
            date: testDate,
            status: 'Present',
            check_in_time: '09:00:00',
          },
        ],
        total: 2,
        page: 1,
        limit: 1000,
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );

      const result = await service.detectLateArrivals(testDate);

      expect(result).toHaveLength(0);
    });

    it('should skip employees without check-in time', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP001',
            date: testDate,
            status: 'Present',
            check_in_time: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 1000,
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );

      const result = await service.detectLateArrivals(testDate);

      expect(result).toHaveLength(0);
      expect(mockEmployeesService.findByEmployeeId).not.toHaveBeenCalled();
    });

    it('should skip employees who are absent', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP001',
            date: testDate,
            status: 'Absent',
            check_in_time: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 1000,
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );

      const result = await service.detectLateArrivals(testDate);

      expect(result).toHaveLength(0);
    });

    it('should use current date when no date is provided', async () => {
      const mockAttendanceRecords = {
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );

      await service.detectLateArrivals();

      const todayStr = new Date().toISOString().split('T')[0];
      expect(mockAttendanceService.findAllPaginated).toHaveBeenCalledWith({
        start_date: todayStr,
        end_date: todayStr,
        limit: 1000,
      });
    });

    it('should skip employees not found in database', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP999',
            date: testDate,
            status: 'Late',
            check_in_time: '09:30:00',
          },
        ],
        total: 1,
        page: 1,
        limit: 1000,
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );
      mockEmployeesService.findByEmployeeId.mockResolvedValue(null);

      const result = await service.detectLateArrivals(testDate);

      expect(result).toHaveLength(0);
    });

    it('should consider 5 minute grace period', async () => {
      const testDate = '2024-01-15';
      const mockAttendanceRecords = {
        data: [
          {
            employee_id: 'EMP001',
            date: testDate,
            status: 'Present',
            check_in_time: '09:05:00', // Within grace period
          },
          {
            employee_id: 'EMP002',
            date: testDate,
            status: 'Present',
            check_in_time: '09:06:00', // Just past grace period
          },
        ],
        total: 2,
        page: 1,
        limit: 1000,
      };

      const mockEmployee = {
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(
        mockAttendanceRecords,
      );
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);

      const result = await service.detectLateArrivals(testDate);

      // Only EMP002 should be detected as late
      expect(result).toHaveLength(1);
      expect(result[0].employee_id).toBe('EMP002');
    });
  });
});
