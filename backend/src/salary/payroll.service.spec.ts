import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollService } from './payroll.service';
import { SalaryService } from './salary.service';
import { EmployeesService } from '../employees/employees.service';
import { Payroll } from './schemas/payroll.schema';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('PayrollService', () => {
  let service: PayrollService;
  let mockPayrollModel: any;
  let mockSalaryService: any;
  let mockEmployeesService: any;

  beforeEach(async () => {
    mockPayrollModel = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockSalaryService = {
      calculateSalary: jest.fn(),
    };

    mockEmployeesService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getModelToken(Payroll.name),
          useValue: mockPayrollModel,
        },
        {
          provide: SalaryService,
          useValue: mockSalaryService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePayroll', () => {
    it('should throw ConflictException if payroll already exists and force_regenerate is false', async () => {
      mockPayrollModel.findOne.mockResolvedValue({ month: 1, year: 2025 });

      await expect(
        service.generatePayroll({
          month: 1,
          year: 2025,
          force_regenerate: false,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if no active employees found', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);
      mockEmployeesService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10000,
      });

      await expect(
        service.generatePayroll({
          month: 1,
          year: 2025,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate payroll for all active employees', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);
      mockEmployeesService.findAll.mockResolvedValue({
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            base_salary: 50000,
            status: 'active',
          },
          {
            employee_id: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            base_salary: 60000,
            status: 'active',
          },
        ],
        total: 2,
        page: 1,
        limit: 10000,
      });

      mockSalaryService.calculateSalary
        .mockResolvedValueOnce({
          employee_id: 'EMP001',
          base_salary: 50000,
          days_worked: 20,
          working_days_in_period: 22,
          absent_days: 2,
          overtime_hours: 10,
          holiday_days: 0,
          daily_rate: 2272.73,
          hourly_rate: 284.09,
          overtime_rate: 426.14,
          base_salary_earned: 45454.6,
          overtime_earnings: 4261.4,
          absence_deductions: 4545.46,
          total_salary: 45170.54,
        })
        .mockResolvedValueOnce({
          employee_id: 'EMP002',
          base_salary: 60000,
          days_worked: 22,
          working_days_in_period: 22,
          absent_days: 0,
          overtime_hours: 0,
          holiday_days: 0,
          daily_rate: 2727.27,
          hourly_rate: 340.91,
          overtime_rate: 511.36,
          base_salary_earned: 60000,
          overtime_earnings: 0,
          absence_deductions: 0,
          total_salary: 60000,
        });

      const createdPayroll = {
        month: 1,
        year: 2025,
        period_start: new Date(2025, 0, 1),
        period_end: new Date(2025, 0, 31),
        total_employees: 2,
        employees_with_incomplete_data: 0,
        total_base_salary: 105454.6,
        total_overtime: 4261.4,
        total_deductions: 4545.46,
        total_payroll: 105170.54,
        status: 'finalized',
      };

      mockPayrollModel.create.mockResolvedValue(createdPayroll);

      const result = await service.generatePayroll({
        month: 1,
        year: 2025,
      });

      expect(result).toEqual(createdPayroll);
      expect(mockSalaryService.calculateSalary).toHaveBeenCalledTimes(2);
      expect(mockPayrollModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          month: 1,
          year: 2025,
          total_employees: 2,
        }),
      );
    });

    it('should mark employees with incomplete data and add warnings', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);
      mockEmployeesService.findAll.mockResolvedValue({
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            base_salary: 0, // Invalid salary
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
      });

      mockSalaryService.calculateSalary.mockResolvedValue({
        employee_id: 'EMP001',
        base_salary: 0,
        days_worked: 0, // No attendance
        working_days_in_period: 22,
        absent_days: 0,
        overtime_hours: 0,
        holiday_days: 0,
        daily_rate: 0,
        hourly_rate: 0,
        overtime_rate: 0,
        base_salary_earned: 0,
        overtime_earnings: 0,
        absence_deductions: 0,
        total_salary: 0,
      });

      const createdPayroll = {
        month: 1,
        year: 2025,
        employees_with_incomplete_data: 1,
      };

      mockPayrollModel.create.mockResolvedValue(createdPayroll);

      const result = await service.generatePayroll({
        month: 1,
        year: 2025,
      });

      expect(mockPayrollModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employees_with_incomplete_data: 1,
          employee_entries: expect.arrayContaining([
            expect.objectContaining({
              has_incomplete_data: true,
              warnings: expect.arrayContaining([
                'Missing or invalid base salary',
                'No attendance records found for this period',
              ]),
            }),
          ]),
        }),
      );
    });

    it('should regenerate payroll if force_regenerate is true', async () => {
      const existingPayroll = { month: 1, year: 2025 };
      mockPayrollModel.findOne.mockResolvedValue(existingPayroll);
      mockEmployeesService.findAll.mockResolvedValue({
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            base_salary: 50000,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
      });

      mockSalaryService.calculateSalary.mockResolvedValue({
        employee_id: 'EMP001',
        base_salary: 50000,
        days_worked: 22,
        working_days_in_period: 22,
        absent_days: 0,
        overtime_hours: 0,
        holiday_days: 0,
        daily_rate: 2272.73,
        hourly_rate: 284.09,
        overtime_rate: 426.14,
        base_salary_earned: 50000,
        overtime_earnings: 0,
        absence_deductions: 0,
        total_salary: 50000,
      });

      const updatedPayroll = { month: 1, year: 2025, status: 'finalized' };
      mockPayrollModel.findOneAndUpdate.mockResolvedValue(updatedPayroll);

      const result = await service.generatePayroll({
        month: 1,
        year: 2025,
        force_regenerate: true,
      });

      expect(mockPayrollModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedPayroll);
    });

    it('should handle calculation errors gracefully', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);
      mockEmployeesService.findAll.mockResolvedValue({
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            base_salary: 50000,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
      });

      mockSalaryService.calculateSalary.mockRejectedValue(
        new Error('Calculation failed'),
      );

      mockPayrollModel.create.mockResolvedValue({
        month: 1,
        year: 2025,
        employees_with_incomplete_data: 1,
      });

      const result = await service.generatePayroll({
        month: 1,
        year: 2025,
      });

      expect(mockPayrollModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employees_with_incomplete_data: 1,
          employee_entries: expect.arrayContaining([
            expect.objectContaining({
              has_incomplete_data: true,
              warnings: expect.arrayContaining([
                'Failed to calculate salary: Calculation failed',
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated payrolls', async () => {
      const payrolls = [
        { month: 1, year: 2025 },
        { month: 12, year: 2024 },
      ];
      mockPayrollModel.exec.mockResolvedValue(payrolls);
      mockPayrollModel.countDocuments.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: payrolls,
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(mockPayrollModel.find).toHaveBeenCalledWith({});
      expect(mockPayrollModel.sort).toHaveBeenCalledWith({
        year: -1,
        month: -1,
      });
    });

    it('should filter payrolls by month and year', async () => {
      const payrolls = [{ month: 1, year: 2025 }];
      mockPayrollModel.exec.mockResolvedValue(payrolls);
      mockPayrollModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({
        month: 1,
        year: 2025,
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(payrolls);
      expect(mockPayrollModel.find).toHaveBeenCalledWith({
        month: 1,
        year: 2025,
      });
    });
  });

  describe('findByMonthYear', () => {
    it('should return payroll for specific month and year', async () => {
      const payroll = { month: 1, year: 2025 };
      mockPayrollModel.findOne.mockResolvedValue(payroll);

      const result = await service.findByMonthYear(1, 2025);

      expect(result).toEqual(payroll);
      expect(mockPayrollModel.findOne).toHaveBeenCalledWith({
        month: 1,
        year: 2025,
      });
    });

    it('should throw NotFoundException if payroll not found', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);

      await expect(service.findByMonthYear(1, 2025)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exportToExcel', () => {
    it('should generate Excel file for payroll', async () => {
      const payroll = {
        month: 1,
        year: 2025,
        total_employees: 1,
        employees_with_incomplete_data: 0,
        total_base_salary: 50000,
        total_overtime: 0,
        total_deductions: 0,
        total_payroll: 50000,
        employee_entries: [
          {
            employee_id: 'EMP001',
            employee_name: 'John Doe',
            base_salary: 50000,
            days_worked: 22,
            working_days_in_period: 22,
            absent_days: 0,
            overtime_hours: 0,
            daily_rate: 2272.73,
            hourly_rate: 284.09,
            overtime_rate: 426.14,
            base_salary_earned: 50000,
            overtime_earnings: 0,
            absence_deductions: 0,
            total_salary: 50000,
            warnings: [],
            has_incomplete_data: false,
          },
        ],
      };

      mockPayrollModel.findOne.mockResolvedValue(payroll);

      const buffer = await service.exportToExcel(1, 2025);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if payroll not found for export', async () => {
      mockPayrollModel.findOne.mockResolvedValue(null);

      await expect(service.exportToExcel(1, 2025)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a payroll', async () => {
      mockPayrollModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.delete(1, 2025);

      expect(mockPayrollModel.deleteOne).toHaveBeenCalledWith({
        month: 1,
        year: 2025,
      });
    });

    it('should throw NotFoundException if payroll not found', async () => {
      mockPayrollModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.delete(1, 2025)).rejects.toThrow(NotFoundException);
    });
  });
});
