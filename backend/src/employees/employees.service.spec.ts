import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmployeesService } from './employees.service';
import { Employee } from './schemas/employee.schema';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';

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
});
