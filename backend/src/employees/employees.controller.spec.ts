import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockEmployeesService = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    exportToExcel: jest.fn(),
    search: jest.fn(),
    findByEmployeeId: jest.fn(),
    updateById: jest.fn(),
    deactivate: jest.fn(),
    getAuditLogs: jest.fn(),
    processExcelUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const paginatedResult = {
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            position: 'Software Engineer',
            base_salary: 75000,
            hire_date: new Date('2024-01-15'),
            status: 'active',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockEmployeesService.findAllPaginated.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({});
      expect(result).toEqual(paginatedResult);
      expect(mockEmployeesService.findAllPaginated).toHaveBeenCalledWith({});
    });

    it('should return paginated employees with filters', async () => {
      const paginatedResult = {
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            position: 'Software Engineer',
            base_salary: 75000,
            hire_date: new Date('2024-01-15'),
            status: 'active',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockEmployeesService.findAllPaginated.mockResolvedValue(paginatedResult);

      const query = {
        page: 1,
        limit: 10,
        department: 'Engineering',
        status: 'active',
      };

      const result = await controller.findAll(query);
      expect(result).toEqual(paginatedResult);
      expect(mockEmployeesService.findAllPaginated).toHaveBeenCalledWith(query);
    });
  });

  describe('uploadExcel', () => {
    it('should throw BadRequestException if no file is uploaded', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(controller.uploadExcel(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should process uploaded Excel file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'employees.xlsx',
        encoding: '7bit',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('mock data'),
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        message: 'Successfully processed 1 employees (1 created, 0 updated)',
        successCount: 1,
        errorCount: 0,
        errors: [],
        created: 1,
        updated: 0,
      };

      mockEmployeesService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile);
      expect(result).toEqual(mockResult);
      expect(mockEmployeesService.processExcelUpload).toHaveBeenCalledWith(
        mockFile.buffer,
      );
    });

    it('should handle Excel processing errors', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'employees.xlsx',
        encoding: '7bit',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('mock data'),
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        success: false,
        message: 'Processed with errors: 0 successful, 1 failed',
        successCount: 0,
        errorCount: 1,
        errors: [
          {
            row: 2,
            employee_id: 'EMP001',
            errors: ['email must be an email'],
          },
        ],
        created: 0,
        updated: 0,
      };

      mockEmployeesService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile);
      expect(result).toEqual(mockResult);
      expect(result.success).toBe(false);
      expect(result.errorCount).toBeGreaterThan(0);
    });
  });

  describe('findAll with search', () => {
    it('should return paginated employees with sorting', async () => {
      const paginatedResult = {
        data: [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            position: 'Software Engineer',
            base_salary: 75000,
            hire_date: new Date('2024-01-15'),
            status: 'active',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockEmployeesService.findAllPaginated.mockResolvedValue(paginatedResult);

      const query = {
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const result = await controller.findAll(query);
      expect(result).toEqual(paginatedResult);
      expect(mockEmployeesService.findAllPaginated).toHaveBeenCalledWith(query);
    });
  });

  describe('exportToExcel', () => {
    it('should export employees to Excel', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      mockEmployeesService.exportToExcel.mockResolvedValue(mockBuffer);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await controller.exportToExcel({}, mockResponse as any);

      expect(mockEmployeesService.exportToExcel).toHaveBeenCalledWith({});

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        'Content-Disposition': expect.stringContaining(
          'attachment; filename=employees-export-',
        ),
        'Content-Length': mockBuffer.length,
      });

      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('findOne', () => {
    it('should return an employee by ID', async () => {
      const employee = {
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

      mockEmployeesService.findByEmployeeId.mockResolvedValue(employee);

      const result = await controller.findOne('EMP001');
      expect(result).toEqual(employee);
      expect(mockEmployeesService.findByEmployeeId).toHaveBeenCalledWith(
        'EMP001',
      );
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const updateData = { first_name: 'Jane' };
      const updatedEmployee = {
        employee_id: 'EMP001',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        position: 'Software Engineer',
        base_salary: 75000,
        hire_date: new Date('2024-01-15'),
        status: 'active',
      };

      mockEmployeesService.updateById.mockResolvedValue(updatedEmployee);

      const result = await controller.update('EMP001', updateData);
      expect(result).toEqual(updatedEmployee);
      expect(mockEmployeesService.updateById).toHaveBeenCalledWith(
        'EMP001',
        updateData,
      );
    });
  });

  describe('partialUpdate', () => {
    it('should partially update an employee', async () => {
      const updateData = { department: 'Sales' };
      const updatedEmployee = {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        department: 'Sales',
        position: 'Software Engineer',
        base_salary: 75000,
        hire_date: new Date('2024-01-15'),
        status: 'active',
      };

      mockEmployeesService.updateById.mockResolvedValue(updatedEmployee);

      const result = await controller.partialUpdate('EMP001', updateData);
      expect(result).toEqual(updatedEmployee);
      expect(mockEmployeesService.updateById).toHaveBeenCalledWith(
        'EMP001',
        updateData,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate an employee', async () => {
      const deactivatedEmployee = {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        position: 'Software Engineer',
        base_salary: 75000,
        hire_date: new Date('2024-01-15'),
        status: 'inactive',
      };

      mockEmployeesService.deactivate.mockResolvedValue(deactivatedEmployee);

      const result = await controller.deactivate('EMP001', {
        reason: 'Resigned',
      });
      expect(result).toEqual(deactivatedEmployee);
      expect(mockEmployeesService.deactivate).toHaveBeenCalledWith(
        'EMP001',
        'hr-employee',
        'Resigned',
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
          changes: { first_name: 'John', last_name: 'Doe' },
          performed_by: 'system',
        },
      ];

      mockEmployeesService.getAuditLogs.mockResolvedValue(auditLogs);

      const result = await controller.getAuditLogs('EMP001');
      expect(result).toEqual(auditLogs);
      expect(mockEmployeesService.getAuditLogs).toHaveBeenCalledWith('EMP001');
    });
  });
});
