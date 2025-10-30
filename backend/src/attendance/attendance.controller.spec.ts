import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { BadRequestException } from '@nestjs/common';
import { Attendance } from './schemas/attendance.schema';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    findAll: jest.fn(),
    processExcelUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all attendance records', async () => {
      const mockAttendance: Attendance[] = [
        {
          employee_id: 'EMP001',
          date: new Date('2025-01-15'),
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 0,
        } as Attendance,
      ];

      mockAttendanceService.findAll.mockResolvedValue(mockAttendance);

      const result = await controller.findAll();
      expect(result).toEqual(mockAttendance);
      expect(mockAttendanceService.findAll).toHaveBeenCalled();
    });
  });

  describe('uploadExcel', () => {
    it('should throw BadRequestException when no file is uploaded', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(controller.uploadExcel(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should process Excel file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'attendance.xlsx',
        encoding: '7bit',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        message: 'Successfully processed 2 attendance records',
        successCount: 2,
        errorCount: 0,
        errors: [],
        created: 2,
        updated: 0,
      };

      mockAttendanceService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile);
      expect(result).toEqual(mockResult);
      expect(mockAttendanceService.processExcelUpload).toHaveBeenCalledWith(
        mockFile.buffer,
        false,
      );
    });

    it('should handle preview mode', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'attendance.xlsx',
        encoding: '7bit',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        message: 'Preview: 2 records ready to import',
        successCount: 2,
        errorCount: 0,
        errors: [],
        created: 0,
        updated: 0,
        preview: [
          {
            employee_id: 'EMP001',
            date: '2025-01-15',
            status: 'Present',
            hours_worked: 8,
            overtime_hours: 0,
          },
        ],
      };

      mockAttendanceService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile, 'true');
      expect(result).toEqual(mockResult);
      expect(mockAttendanceService.processExcelUpload).toHaveBeenCalledWith(
        mockFile.buffer,
        true,
      );
    });

    it('should handle upload errors', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'attendance.xlsx',
        encoding: '7bit',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        success: false,
        message: 'Processed with errors: 1 successful, 1 failed',
        successCount: 1,
        errorCount: 1,
        errors: [
          {
            row: 2,
            employee_id: 'EMP999',
            date: '2025-01-15',
            errors: ['Employee ID EMP999 does not exist in system'],
          },
        ],
        created: 1,
        updated: 0,
      };

      mockAttendanceService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});
