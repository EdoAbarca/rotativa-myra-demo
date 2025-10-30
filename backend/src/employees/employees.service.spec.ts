import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmployeesService } from './employees.service';
import { Employee } from './schemas/employee.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { AuditService } from '../audit/audit.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let model: Model<Employee>;

  const mockEmployee = {
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    position: 'Software Engineer',
    base_salary: 75000,
    hire_date: new Date('2024-01-15'),
    status: 'active',
  };

  const mockAuditService = {
    log: jest.fn(),
    findByEntity: jest.fn(),
  };

  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  const mockModelConstructor = jest.fn().mockImplementation((dto: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const instance = {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return instance;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getModelToken(Employee.name),
          useValue: mockModelConstructor,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    model = module.get<Model<Employee>>(getModelToken(Employee.name));

    // Reset mockModel methods
    Object.assign(model, mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockEmployee);
      mockModelConstructor.mockImplementationOnce((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      await service.create(mockEmployee);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const employees = [mockEmployee];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(employees),
      });

      const result = await service.findAll();
      expect(result).toEqual(employees);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findByEmployeeId', () => {
    it('should return an employee by employee_id', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      const result = await service.findByEmployeeId('EMP001');
      expect(result).toEqual(mockEmployee);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        employee_id: 'EMP001',
      });
    });

    it('should return null if employee not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmployeeId('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const updateData = { first_name: 'Jane' };
      const updatedEmployee = { ...mockEmployee, ...updateData };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEmployee),
      });

      const result = await service.update('EMP001', updateData);
      expect(result).toEqual(updatedEmployee);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { employee_id: 'EMP001' },
        updateData,
        { new: true },
      );
    });
  });

  describe('processExcelUpload', () => {
    it('should throw error for empty Excel file', async () => {
      const workbook = new ExcelJS.Workbook();
      const buffer = await workbook.xlsx.writeBuffer();

      await expect(
        service.processExcelUpload(buffer as Buffer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for missing required columns', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      // Add incomplete header
      worksheet.addRow(['employee_id', 'first_name']);

      const buffer = await workbook.xlsx.writeBuffer();

      await expect(
        service.processExcelUpload(buffer as Buffer),
      ).rejects.toThrow('Missing required columns');
    });

    it('should successfully process valid Excel file with new employees', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      // Add header
      worksheet.addRow([
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
        'status',
      ]);

      // Add employee data
      worksheet.addRow([
        'EMP001',
        'John',
        'Doe',
        'john.doe@example.com',
        'Engineering',
        'Software Engineer',
        75000,
        new Date('2024-01-15'),
        'active',
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock that employee doesn't exist
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock save
      const saveMock = jest.fn().mockResolvedValue(mockEmployee);
      mockModelConstructor.mockImplementation((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      const result = await service.processExcelUpload(buffer as Buffer);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errorCount).toBe(0);
    });

    it('should handle duplicate employees by updating', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.addRow([
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
        'status',
      ]);

      worksheet.addRow([
        'EMP001',
        'John',
        'Doe',
        'john.doe@example.com',
        'Engineering',
        'Software Engineer',
        75000,
        new Date('2024-01-15'),
        'active',
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock that employee exists
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      // Mock update
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      const result = await service.processExcelUpload(buffer as Buffer);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.created).toBe(0);
      expect(result.updated).toBe(1);
    });

    it('should handle validation errors', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.addRow([
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
        'status',
      ]);

      // Add invalid data (invalid email)
      worksheet.addRow([
        'EMP001',
        'John',
        'Doe',
        'invalid-email',
        'Engineering',
        'Software Engineer',
        75000,
        new Date('2024-01-15'),
        'active',
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await service.processExcelUpload(buffer as Buffer);

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].row).toBe(2);
    });

    it('should handle negative salary validation', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.addRow([
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
        'status',
      ]);

      // Add invalid data (negative salary)
      worksheet.addRow([
        'EMP001',
        'John',
        'Doe',
        'john.doe@example.com',
        'Engineering',
        'Software Engineer',
        -1000,
        new Date('2024-01-15'),
        'active',
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await service.processExcelUpload(buffer as Buffer);

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].row).toBe(2);
    });

    it('should handle invalid status values', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.addRow([
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
        'status',
      ]);

      // Add invalid data (invalid status)
      worksheet.addRow([
        'EMP001',
        'John',
        'Doe',
        'john.doe@example.com',
        'Engineering',
        'Software Engineer',
        75000,
        new Date('2024-01-15'),
        'invalid_status',
      ]);

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await service.processExcelUpload(buffer as Buffer);

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
    });
  });

  describe('search', () => {
    it('should search employees by name', async () => {
      const employees = [mockEmployee];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(employees),
      });

      const result = await service.search({ name: 'John' });
      expect(result).toEqual(employees);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should search employees by employee_id', async () => {
      const employees = [mockEmployee];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(employees),
      });

      const result = await service.search({ employee_id: 'EMP001' });
      expect(result).toEqual(employees);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should search employees by department', async () => {
      const employees = [mockEmployee];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(employees),
      });

      const result = await service.search({ department: 'Engineering' });
      expect(result).toEqual(employees);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should search employees by status', async () => {
      const employees = [mockEmployee];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(employees),
      });

      const result = await service.search({ status: 'active' });
      expect(result).toEqual(employees);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('should update an employee by ID', async () => {
      const updateData = { first_name: 'Jane' };
      const updatedEmployee = { ...mockEmployee, ...updateData };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEmployee),
      });

      const result = await service.updateById('EMP001', updateData);
      expect(result).toEqual(updatedEmployee);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateById('NONEXISTENT', { first_name: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an employee', async () => {
      const deactivatedEmployee = { ...mockEmployee, status: 'inactive' };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deactivatedEmployee),
      });

      const result = await service.deactivate(
        'EMP001',
        'hr-employee',
        'Resigned',
      );
      expect(result.status).toBe('inactive');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deactivate',
          reason: 'Resigned',
        }),
      );
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deactivate('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if employee already inactive', async () => {
      const inactiveEmployee = { ...mockEmployee, status: 'inactive' };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inactiveEmployee),
      });

      await expect(service.deactivate('EMP001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs for an employee', async () => {
      const auditLogs = [
        {
          entity_type: 'Employee',
          entity_id: 'EMP001',
          action: 'create',
          changes: mockEmployee,
          performed_by: 'system',
        },
      ];

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      mockAuditService.findByEntity.mockResolvedValue(auditLogs);

      const result = await service.getAuditLogs('EMP001');
      expect(result).toEqual(auditLogs);
      expect(mockAuditService.findByEntity).toHaveBeenCalledWith(
        'Employee',
        'EMP001',
      );
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getAuditLogs('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
