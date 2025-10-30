import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { BadRequestException } from '@nestjs/common';
import { Attendance } from './schemas/attendance.schema';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    getDailySummary: jest.fn(),
    getStatistics: jest.fn(),
    exportToExcel: jest.fn(),
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.findAll({} as any);
      expect(result).toEqual(mockAttendance);
      expect(mockAttendanceService.findAll).toHaveBeenCalled();
    });

    it('should return paginated attendance records with query', async () => {
      const mockResponse = {
        data: [
          {
            employee_id: 'EMP001',
            date: new Date('2025-01-15'),
            status: 'Present',
            hours_worked: 8,
            overtime_hours: 0,
          } as Attendance,
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockAttendanceService.findAllPaginated.mockResolvedValue(mockResponse);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const query = { page: 1, limit: 10 } as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.findAll(query);
      expect(result).toEqual(mockResponse);
      expect(mockAttendanceService.findAllPaginated).toHaveBeenCalledWith(
        query,
      );
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

  describe('getDailySummary', () => {
    it('should return daily summary for specified date', async () => {
      const mockSummary = {
        date: '2025-01-15',
        total: 10,
        present: 8,
        absent: 1,
        late: 1,
        presentPercentage: 80,
        absentPercentage: 10,
        latePercentage: 10,
      };

      mockAttendanceService.getDailySummary.mockResolvedValue(mockSummary);

      const result = await controller.getDailySummary('2025-01-15');
      expect(result).toEqual(mockSummary);
      expect(mockAttendanceService.getDailySummary).toHaveBeenCalledWith(
        '2025-01-15',
      );
    });

    it('should return daily summary for today if no date specified', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockSummary = {
        date: today,
        total: 10,
        present: 8,
        absent: 1,
        late: 1,
        presentPercentage: 80,
        absentPercentage: 10,
        latePercentage: 10,
      };

      mockAttendanceService.getDailySummary.mockResolvedValue(mockSummary);

      const result = await controller.getDailySummary();
      expect(result).toEqual(mockSummary);
      expect(mockAttendanceService.getDailySummary).toHaveBeenCalledWith(today);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics with date range and employee filter', async () => {
      const mockStats = {
        totalEmployees: 5,
        dateRange: {
          start: '2025-01-01',
          end: '2025-01-31',
        },
        summary: {
          date: '2025-01-01',
          total: 100,
          present: 85,
          absent: 10,
          late: 5,
          presentPercentage: 85,
          absentPercentage: 10,
          latePercentage: 5,
        },
        dailyBreakdown: [],
        employeeBreakdown: [],
      };

      mockAttendanceService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics(
        '2025-01-01',
        '2025-01-31',
        'EMP001',
      );
      expect(result).toEqual(mockStats);
      expect(mockAttendanceService.getStatistics).toHaveBeenCalledWith(
        '2025-01-01',
        '2025-01-31',
        'EMP001',
      );
    });
  });

  describe('exportToExcel', () => {
    it('should export attendance data to Excel', async () => {
      const mockBuffer = Buffer.from('test excel data');
      mockAttendanceService.exportToExcel.mockResolvedValue(mockBuffer);

      const mockResponse = {
        set: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const query = { employee_id: 'EMP001' } as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.exportToExcel(query, mockResponse as any);

      expect(result).toBeDefined();
      expect(mockAttendanceService.exportToExcel).toHaveBeenCalledWith(query);

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        'Content-Disposition': expect.stringContaining(
          'attachment; filename="attendance_report_',
        ),
      });
    });
  });
});
