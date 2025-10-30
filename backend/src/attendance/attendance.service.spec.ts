import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { Attendance } from './schemas/attendance.schema';
import { EmployeesService } from '../employees/employees.service';
import { BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockAttendance = {
    employee_id: 'EMP001',
    date: new Date('2025-01-15'),
    status: 'Present',
    check_in_time: '09:00',
    check_out_time: '17:00',
    hours_worked: 8,
    overtime_hours: 0,
  };

  const mockEmployeesService = {
    findByEmployeeId: jest.fn(),
  };

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
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

  // Add model static methods to the constructor
  Object.assign(mockModelConstructor, mockModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getModelToken(Attendance.name),
          useValue: mockModelConstructor,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create attendance record with calculated hours', async () => {
      const dto = {
        employee_id: 'EMP001',
        date: '2025-01-15',
        status: 'Present',
        check_in_time: '09:00',
        check_out_time: '17:00',
      };

      const saveMock = jest.fn().mockResolvedValue({
        ...dto,
        hours_worked: 8,
        overtime_hours: 0,
      });

      mockModelConstructor.mockImplementationOnce((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      const result = await service.create(dto);
      expect(result.hours_worked).toBe(8);
      expect(result.overtime_hours).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all attendance records', async () => {
      const mockRecords = [mockAttendance];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockRecords);
    });
  });

  describe('findByEmployeeIdAndDate', () => {
    it('should find attendance by employee_id and date', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttendance),
      });

      const result = await service.findByEmployeeIdAndDate(
        'EMP001',
        '2025-01-15',
      );
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('processExcelUpload', () => {
    it('should reject invalid file format', async () => {
      const buffer = Buffer.from('invalid');
      await expect(service.processExcelUpload(buffer)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate required headers', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      // Add incorrect headers
      worksheet.columns = [{ header: 'wrong_header', key: 'wrong', width: 15 }];

      const buffer = await workbook.xlsx.writeBuffer();

      await expect(
        service.processExcelUpload(Buffer.from(buffer)),
      ).rejects.toThrow('Missing required columns');
    });

    it('should process valid attendance data in preview mode', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
        { header: 'check_in_time', key: 'check_in_time', width: 12 },
        { header: 'check_out_time', key: 'check_out_time', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        date: '2025-01-15',
        status: 'Present',
        check_in_time: '09:00',
        check_out_time: '17:00',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.preview).toBeDefined();
      expect(result.preview?.length).toBe(1);
      expect(result.preview?.[0].employee_id).toBe('EMP001');
    });

    it('should validate employee_id exists', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'INVALID',
        date: '2025-01-15',
        status: 'Present',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue(null);

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].errors[0]).toContain('does not exist');
    });

    it('should calculate hours from check-in and check-out times', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
        { header: 'check_in_time', key: 'check_in_time', width: 12 },
        { header: 'check_out_time', key: 'check_out_time', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        date: '2025-01-15',
        status: 'Present',
        check_in_time: '09:00',
        check_out_time: '19:00', // 10 hours total
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.preview?.[0].hours_worked).toBe(8); // Standard hours
      expect(result.preview?.[0].overtime_hours).toBe(2); // Overtime
    });

    it('should handle Absent status correctly', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        date: '2025-01-15',
        status: 'Absent',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.preview?.[0].hours_worked).toBe(0);
      expect(result.preview?.[0].overtime_hours).toBe(0);
    });

    it('should validate date format', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        date: 'invalid-date',
        status: 'Present',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('should validate status enum', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'date', key: 'date', width: 15 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        date: '2025-01-15',
        status: 'InvalidStatus',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors[0].errors[0]).toContain('must be one of');
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated attendance records', async () => {
      const mockRecords = [mockAttendance];

      // Create a proper mock chain
      const execMock = jest.fn().mockResolvedValue(mockRecords);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const countExecMock = jest.fn().mockResolvedValue(1);
      mockModel.countDocuments.mockReturnValue({ exec: countExecMock });

      const query = { page: 1, limit: 10 };
      const result = await service.findAllPaginated(query);

      expect(result.data).toEqual(mockRecords);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by employee_id', async () => {
      const mockRecords = [mockAttendance];

      const execMock = jest.fn().mockResolvedValue(mockRecords);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const countExecMock = jest.fn().mockResolvedValue(1);
      mockModel.countDocuments.mockReturnValue({ exec: countExecMock });

      const query = { employee_id: 'EMP001', page: 1, limit: 10 };
      await service.findAllPaginated(query);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ employee_id: 'EMP001' }),
      );
    });

    it('should filter by date range', async () => {
      const mockRecords = [mockAttendance];

      const execMock = jest.fn().mockResolvedValue(mockRecords);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const countExecMock = jest.fn().mockResolvedValue(1);
      mockModel.countDocuments.mockReturnValue({ exec: countExecMock });

      const query = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        page: 1,
        limit: 10,
      };
      await service.findAllPaginated(query);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          date: expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            $gte: expect.any(Date),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            $lte: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getDailySummary', () => {
    it('should return daily summary statistics', async () => {
      const mockRecords = [
        { ...mockAttendance, status: 'Present' },
        { ...mockAttendance, status: 'Present' },
        { ...mockAttendance, status: 'Absent' },
        { ...mockAttendance, status: 'Late' },
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await service.getDailySummary('2025-01-15');

      expect(result.date).toBe('2025-01-15');
      expect(result.total).toBe(4);
      expect(result.present).toBe(2);
      expect(result.absent).toBe(1);
      expect(result.late).toBe(1);
      expect(result.presentPercentage).toBe(50);
    });

    it('should handle empty results', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getDailySummary('2025-01-15');

      expect(result.total).toBe(0);
      expect(result.presentPercentage).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return comprehensive statistics', async () => {
      const mockRecords = [
        {
          employee_id: 'EMP001',
          date: new Date('2025-01-15'),
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 0,
        },
        {
          employee_id: 'EMP001',
          date: new Date('2025-01-16'),
          status: 'Late',
          hours_worked: 7,
          overtime_hours: 0,
        },
        {
          employee_id: 'EMP002',
          date: new Date('2025-01-15'),
          status: 'Present',
          hours_worked: 8,
          overtime_hours: 2,
        },
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await service.getStatistics('2025-01-15', '2025-01-16');

      expect(result.totalEmployees).toBe(2);
      expect(result.summary.total).toBe(3);
      expect(result.summary.present).toBe(2);
      expect(result.summary.late).toBe(1);
      expect(result.dailyBreakdown).toBeDefined();
      expect(result.employeeBreakdown).toBeDefined();
      expect(result.employeeBreakdown.length).toBe(2);
    });

    it('should use default date range when not specified', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getStatistics();

      expect(result.dateRange).toBeDefined();
      expect(result.dateRange.start).toBeDefined();
      expect(result.dateRange.end).toBeDefined();
    });
  });

  describe('exportToExcel', () => {
    it('should export attendance data to Excel buffer', async () => {
      const mockRecords = [mockAttendance];

      const execMock = jest.fn().mockResolvedValue(mockRecords);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const query = { employee_id: 'EMP001' };
      const buffer = await service.exportToExcel(query);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should apply filters when exporting', async () => {
      const mockRecords = [mockAttendance];

      const execMock = jest.fn().mockResolvedValue(mockRecords);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      mockModel.find.mockReturnValue({ sort: sortMock });

      const query = {
        employee_id: 'EMP001',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        status: 'Present',
      };
      await service.exportToExcel(query);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 'EMP001',
          status: 'Present',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          date: expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            $gte: expect.any(Date),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            $lte: expect.any(Date),
          }),
        }),
      );
    });
  });
});
