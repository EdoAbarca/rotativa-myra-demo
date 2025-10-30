/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SalaryService } from './salary.service';
import { SalaryCalculation } from './schemas/salary-calculation.schema';
import { Holiday } from './schemas/holiday.schema';
import { EmployeesService } from '../employees/employees.service';
import { AttendanceService } from '../attendance/attendance.service';
import { NotFoundException } from '@nestjs/common';

describe('SalaryService', () => {
  let service: SalaryService;

  const mockSalaryCalculationModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHolidayModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmployeesService = {
    findByEmployeeId: jest.fn(),
  };

  const mockAttendanceService = {
    findAllPaginated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryService,
        {
          provide: getModelToken(SalaryCalculation.name),
          useValue: mockSalaryCalculationModel,
        },
        {
          provide: getModelToken(Holiday.name),
          useValue: mockHolidayModel,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    service = module.get<SalaryService>(SalaryService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSalary', () => {
    const mockEmployee = {
      employee_id: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
      position: 'Developer',
      base_salary: 44000, // 44,000 per month
      hire_date: new Date('2023-01-01'),
      status: 'active',
    };

    it('should calculate base salary correctly for full month', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockHolidayModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: Array(22).fill({
          employee_id: 'EMP001',
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 0,
        }),
        pagination: { page: 1, limit: 1000, total: 22, totalPages: 1 },
      });

      const savedData = {
        employee_id: 'EMP001',
        base_salary: 44000,
        total_salary: 44000,
        save: jest.fn(),
      };

      const mockSave = jest.fn().mockResolvedValue(savedData);

      // Create a proper mock constructor and add findOne method
      const SalaryCalculationConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      SalaryCalculationConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['salaryCalculationModel'] = SalaryCalculationConstructor;

      const result = await service.calculateSalary({
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      });

      expect(mockEmployeesService.findByEmployeeId).toHaveBeenCalledWith(
        'EMP001',
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toHaveProperty('employee_id', 'EMP001');
      expect(result).toHaveProperty('base_salary', 44000);
    });

    it('should calculate overtime at 1.5x rate', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockHolidayModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      // Mock attendance with overtime
      const attendanceWithOvertime = Array(22)
        .fill(null)
        .map(() => ({
          employee_id: 'EMP001',
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 2, // 2 hours overtime each day
        }));

      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: attendanceWithOvertime,
        pagination: { page: 1, limit: 1000, total: 22, totalPages: 1 },
      });

      const mockSave = jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });

      const SalaryCalculationConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      SalaryCalculationConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['salaryCalculationModel'] = SalaryCalculationConstructor;

      const result = await service.calculateSalary({
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      });

      expect(result.overtime_hours).toBe(44); // 22 days * 2 hours
      expect(result.overtime_earnings).toBeGreaterThan(0);

      // Verify overtime rate is 1.5x hourly rate
      const expectedHourlyRate = Math.round((44000 / 22 / 8) * 100) / 100;
      const expectedOvertimeRate =
        Math.round(expectedHourlyRate * 1.5 * 100) / 100;
      expect(result.overtime_rate).toBe(expectedOvertimeRate);
    });

    it('should deduct absences from salary', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockHolidayModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      // Mock attendance with 2 absences
      const attendanceData = [
        ...Array(20)
          .fill(null)
          .map(() => ({
            employee_id: 'EMP001',
            status: 'Present',
            hours_worked: 8,
            overtime_hours: 0,
            date: new Date('2025-01-01'),
          })),
        {
          employee_id: 'EMP001',
          status: 'Absent',
          hours_worked: 0,
          overtime_hours: 0,
          date: new Date('2025-01-15'),
        },
        {
          employee_id: 'EMP001',
          status: 'Absent',
          hours_worked: 0,
          overtime_hours: 0,
          date: new Date('2025-01-16'),
        },
      ];

      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: attendanceData,
        pagination: { page: 1, limit: 1000, total: 22, totalPages: 1 },
      });

      const mockSave = jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });

      const SalaryCalculationConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      SalaryCalculationConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['salaryCalculationModel'] = SalaryCalculationConstructor;

      const result = await service.calculateSalary({
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      });

      expect(result.absent_days).toBe(2);
      expect(result.absence_deductions).toBeGreaterThan(0);

      // Verify deduction amount (2 days * daily rate)
      const expectedDailyRate = Math.round((44000 / 22) * 100) / 100;
      const expectedDeduction = Math.round(expectedDailyRate * 2 * 100) / 100;
      expect(result.absence_deductions).toBe(expectedDeduction);
    });

    it('should not deduct absences on holidays', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);

      // Mock a holiday on Jan 15
      const holidays = [
        {
          date: new Date('2025-01-15'),
          name: 'National Holiday',
          is_paid: true,
        },
      ];

      mockHolidayModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(holidays),
      });

      // Mock attendance with absence on holiday
      const attendanceData = [
        ...Array(21)
          .fill(null)
          .map(() => ({
            employee_id: 'EMP001',
            status: 'Present',
            hours_worked: 8,
            overtime_hours: 0,
            date: new Date('2025-01-01'),
          })),
        {
          employee_id: 'EMP001',
          status: 'Absent',
          hours_worked: 0,
          overtime_hours: 0,
          date: new Date('2025-01-15'), // Absence on holiday
        },
      ];

      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: attendanceData,
        pagination: { page: 1, limit: 1000, total: 22, totalPages: 1 },
      });

      const mockSave = jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });

      const SalaryCalculationConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      SalaryCalculationConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['salaryCalculationModel'] = SalaryCalculationConstructor;

      const result = await service.calculateSalary({
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      });

      // Absence on holiday should not be deducted
      expect(result.holiday_days).toBe(1);
      expect(result.absent_days).toBe(1);
      expect(result.absence_deductions).toBe(0); // No deduction for holiday absence
    });

    it('should throw NotFoundException for invalid employee', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(null);

      await expect(
        service.calculateSalary({
          employee_id: 'INVALID',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update existing salary calculation', async () => {
      mockEmployeesService.findByEmployeeId.mockResolvedValue(mockEmployee);
      mockHolidayModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      mockAttendanceService.findAllPaginated.mockResolvedValue({
        data: Array(22).fill({
          employee_id: 'EMP001',
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 0,
        }),
        pagination: { page: 1, limit: 1000, total: 22, totalPages: 1 },
      });

      // Mock existing calculation
      const existingCalculation = {
        employee_id: 'EMP001',
        period_start: new Date('2025-01-01'),
        period_end: new Date('2025-01-31'),
        total_salary: 40000,
      };

      mockSalaryCalculationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingCalculation),
      });

      mockSalaryCalculationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...existingCalculation,
          total_salary: 44000,
        }),
      });

      const result = await service.calculateSalary({
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      });

      expect(mockSalaryCalculationModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result.total_salary).toBe(44000);
    });
  });

  describe('findAll', () => {
    it('should return paginated salary calculations', async () => {
      const mockCalculations = [
        { employee_id: 'EMP001', total_salary: 44000 },
        { employee_id: 'EMP002', total_salary: 50000 },
      ];

      mockSalaryCalculationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockCalculations),
            }),
          }),
        }),
      });

      mockSalaryCalculationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockCalculations);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by employee_id', async () => {
      mockSalaryCalculationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockSalaryCalculationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({ employee_id: 'EMP001', page: 1, limit: 10 });

      expect(mockSalaryCalculationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ employee_id: 'EMP001' }),
      );
    });
  });

  describe('Holiday Management', () => {
    it('should create a new holiday', async () => {
      const holidayData = {
        date: new Date('2025-12-25'),
        name: 'Christmas',
        description: 'Christmas Day',
        is_paid: true,
      };

      const mockSave = jest.fn().mockResolvedValue(holidayData);
      const HolidayConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      HolidayConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['holidayModel'] = HolidayConstructor;

      const result = await service.createHoliday(
        '2025-12-25',
        'Christmas',
        'Christmas Day',
      );

      expect(mockSave).toHaveBeenCalled();
      expect(result.name).toBe('Christmas');
    });

    it('should update existing holiday', async () => {
      const existingHoliday = {
        date: new Date('2025-12-25'),
        name: 'Old Name',
        description: 'Old Description',
        is_paid: true,
        save: jest.fn().mockResolvedValue({
          date: new Date('2025-12-25'),
          name: 'Christmas',
          description: 'Christmas Day',
          is_paid: true,
        }),
      };

      mockHolidayModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingHoliday),
      });

      const result = await service.createHoliday(
        '2025-12-25',
        'Christmas',
        'Christmas Day',
      );

      expect(existingHoliday.save).toHaveBeenCalled();
      expect(result.name).toBe('Christmas');
    });

    it('should get all holidays', async () => {
      const holidays = [
        { date: new Date('2025-12-25'), name: 'Christmas' },
        { date: new Date('2025-01-01'), name: 'New Year' },
      ];

      mockHolidayModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(holidays),
        }),
      });

      const result = await service.getAllHolidays();

      expect(result).toEqual(holidays);
      expect(mockHolidayModel.find).toHaveBeenCalled();
    });

    it('should delete a holiday', async () => {
      mockHolidayModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.deleteHoliday('2025-12-25');

      expect(mockHolidayModel.deleteOne).toHaveBeenCalledWith({
        date: new Date('2025-12-25'),
      });
    });

    it('should create recurring holiday', async () => {
      const holidayData = {
        date: new Date('2025-12-25'),
        name: 'Christmas',
        description: 'Christmas Day',
        is_paid: true,
        is_recurring: true,
        recurring_month: 12,
        recurring_day: 25,
      };

      const mockSave = jest.fn().mockResolvedValue(holidayData);
      const HolidayConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      HolidayConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['holidayModel'] = HolidayConstructor;

      const result = await service.createHoliday(
        '2025-12-25',
        'Christmas',
        'Christmas Day',
        true,
        true,
        12,
        25,
      );

      expect(mockSave).toHaveBeenCalled();
      expect(result.is_recurring).toBe(true);
      expect(result.recurring_month).toBe(12);
      expect(result.recurring_day).toBe(25);
    });

    it('should filter holidays by date range', async () => {
      const holidays = [
        { date: new Date('2025-12-25'), name: 'Christmas' },
        { date: new Date('2025-01-01'), name: 'New Year' },
      ];

      mockHolidayModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(holidays),
        }),
      });

      const result = await service.getAllHolidays({
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      });

      expect(mockHolidayModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: {
            $gte: new Date('2025-01-01'),
            $lte: new Date('2025-12-31'),
          },
        }),
      );
      expect(result).toEqual(holidays);
    });

    it('should filter holidays by is_recurring', async () => {
      const holidays = [
        {
          date: new Date('2025-12-25'),
          name: 'Christmas',
          is_recurring: true,
        },
      ];

      mockHolidayModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(holidays),
        }),
      });

      await service.getAllHolidays({ is_recurring: true });

      expect(mockHolidayModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          is_recurring: true,
        }),
      );
    });

    it('should generate recurring holidays for a year', async () => {
      const recurringHoliday = {
        name: 'Christmas',
        description: 'Christmas Day',
        is_paid: true,
        is_recurring: true,
        recurring_month: 12,
        recurring_day: 25,
      };

      const mockSave = jest.fn().mockResolvedValue({
        date: new Date(2025, 11, 25),
        name: 'Christmas',
        description: 'Christmas Day',
        is_paid: true,
        is_recurring: false,
      });

      const HolidayConstructor: any = jest
        .fn()
        .mockImplementation((data: any) => ({
          ...data,
          save: mockSave,
        }));

      // Add find method to the constructor for recurring holidays
      HolidayConstructor.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([recurringHoliday]),
      });

      // Add findOne method to check if holiday exists
      HolidayConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service['holidayModel'] = HolidayConstructor;

      const result = await service.generateRecurringHolidays(2025);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Christmas');
      expect(result[0].is_recurring).toBe(false);
    });

    it('should not duplicate existing holidays when generating recurring', async () => {
      const recurringHoliday = {
        name: 'Christmas',
        is_paid: true,
        is_recurring: true,
        recurring_month: 12,
        recurring_day: 25,
      };

      const HolidayConstructor: any = jest.fn();

      // Mock finding recurring holidays
      HolidayConstructor.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([recurringHoliday]),
      });

      // Mock that holiday already exists
      HolidayConstructor.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          date: new Date(2025, 11, 25),
          name: 'Christmas',
        }),
      });

      service['holidayModel'] = HolidayConstructor;

      const result = await service.generateRecurringHolidays(2025);

      expect(result).toHaveLength(0);
    });

    it('should update a holiday by ID', async () => {
      const updatedHoliday = {
        name: 'Updated Christmas',
        description: 'Updated description',
      };

      mockHolidayModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedHoliday),
      });

      const result = await service.updateHoliday('holiday-id-123', {
        name: 'Updated Christmas',
      });

      expect(mockHolidayModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'holiday-id-123',
        { name: 'Updated Christmas' },
        { new: true },
      );
      expect(result).toEqual(updatedHoliday);
    });

    it('should get a holiday by ID', async () => {
      const holiday = {
        date: new Date('2025-12-25'),
        name: 'Christmas',
      };

      mockHolidayModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(holiday),
      });

      const result = await service.getHolidayById('holiday-id-123');

      expect(mockHolidayModel.findById).toHaveBeenCalledWith('holiday-id-123');
      expect(result).toEqual(holiday);
    });

    it('should delete a holiday by ID', async () => {
      mockHolidayModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      await service.deleteHolidayById('holiday-id-123');

      expect(mockHolidayModel.findByIdAndDelete).toHaveBeenCalledWith(
        'holiday-id-123',
      );
    });
  });
});
