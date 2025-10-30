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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const model = module.get(getModelToken(Attendance.name));
    Object.assign(model, mockModel);
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
});
