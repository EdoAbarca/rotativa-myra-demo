import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockEmployeesService = {
    findAll: jest.fn(),
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
    it('should return an array of employees', async () => {
      const employees = [
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
      ];

      mockEmployeesService.findAll.mockResolvedValue(employees);

      const result = await controller.findAll();
      expect(result).toEqual(employees);
      expect(mockEmployeesService.findAll).toHaveBeenCalled();
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
});
