import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service';
import { Leave } from './schemas/leave.schema';
import { LeaveBalance } from './schemas/leave-balance.schema';
import { EmployeesService } from '../employees/employees.service';
import { BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

describe('LeavesService', () => {
  let service: LeavesService;

  const mockLeave = {
    employee_id: 'EMP001',
    leave_type: 'Vacation',
    start_date: new Date('2025-01-15'),
    end_date: new Date('2025-01-20'),
    status: 'Approved',
    reason: 'Family vacation',
  };

  const mockEmployeesService = {
    findByEmployeeId: jest.fn(),
  };

  const mockLeaveModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  const mockLeaveBalanceModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  const mockLeaveModelConstructor = jest.fn().mockImplementation((dto: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const instance = {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return instance;
  });

  const mockLeaveBalanceModelConstructor = jest
    .fn()
    .mockImplementation((dto: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const instance = {
        ...dto,
        save: jest.fn().mockResolvedValue(dto),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return instance;
    });

  // Add model static methods to the constructors
  Object.assign(mockLeaveModelConstructor, mockLeaveModel);
  Object.assign(mockLeaveBalanceModelConstructor, mockLeaveBalanceModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {
          provide: getModelToken(Leave.name),
          useValue: mockLeaveModelConstructor,
        },
        {
          provide: getModelToken(LeaveBalance.name),
          useValue: mockLeaveBalanceModelConstructor,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw error if end date is before start date', async () => {
      const dto = {
        employee_id: 'EMP001',
        leave_type: 'Vacation',
        start_date: '2025-01-20',
        end_date: '2025-01-15',
        status: 'Pending',
      };

      await expect(service.create(dto)).rejects.toThrow(
        'End date must be after start date',
      );
    });

    it('should create leave record without overlap', async () => {
      const dto = {
        employee_id: 'EMP001',
        leave_type: 'Vacation',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        status: 'Pending',
      };

      mockLeaveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No overlap
      });

      const saveMock = jest.fn().mockResolvedValue(dto);

      mockLeaveModelConstructor.mockImplementationOnce((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('checkOverlap', () => {
    it('should detect overlapping leaves', async () => {
      mockLeaveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeave), // Overlap found
      });

      const hasOverlap = await service.checkOverlap(
        'EMP001',
        '2025-01-18',
        '2025-01-25',
      );
      expect(hasOverlap).toBe(true);
    });

    it('should return false when no overlap', async () => {
      mockLeaveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No overlap
      });

      const hasOverlap = await service.checkOverlap(
        'EMP001',
        '2025-02-01',
        '2025-02-05',
      );
      expect(hasOverlap).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all leave records', async () => {
      const mockRecords = [mockLeave];
      mockLeaveModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockRecords);
    });
  });

  describe('getOrCreateLeaveBalance', () => {
    it('should return existing balance', async () => {
      const mockBalance = {
        employee_id: 'EMP001',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5,
        vacation_used: 5,
        sick_used: 2,
        personal_used: 1,
      };

      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBalance),
      });

      const result = await service.getOrCreateLeaveBalance('EMP001');
      expect(result).toEqual(mockBalance);
    });

    it('should create new balance if not exists', async () => {
      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const newBalance = {
        employee_id: 'EMP001',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5,
        vacation_used: 0,
        sick_used: 0,
        personal_used: 0,
      };

      const saveMock = jest.fn().mockResolvedValue(newBalance);

      mockLeaveBalanceModelConstructor.mockImplementationOnce((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      const result = await service.getOrCreateLeaveBalance('EMP001');
      expect(result).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
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
      const worksheet = workbook.addWorksheet('Leaves');

      // Add incorrect headers
      worksheet.columns = [{ header: 'wrong_header', key: 'wrong', width: 15 }];

      const buffer = await workbook.xlsx.writeBuffer();

      await expect(
        service.processExcelUpload(Buffer.from(buffer)),
      ).rejects.toThrow('Missing required columns');
    });

    it('should process valid Excel file in preview mode', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leaves');

      // Add headers
      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'leave_type', key: 'leave_type', width: 12 },
        { header: 'start_date', key: 'start_date', width: 12 },
        { header: 'end_date', key: 'end_date', width: 12 },
        { header: 'status', key: 'status', width: 12 },
        { header: 'reason', key: 'reason', width: 30 },
      ];

      // Add data row
      worksheet.addRow({
        employee_id: 'EMP001',
        leave_type: 'Vacation',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        status: 'Approved',
        reason: 'Family vacation',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock employee exists
      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      // Mock no overlap
      mockLeaveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
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
    });

    it('should detect employee not found', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leaves');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'leave_type', key: 'leave_type', width: 12 },
        { header: 'start_date', key: 'start_date', width: 12 },
        { header: 'end_date', key: 'end_date', width: 12 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP999',
        leave_type: 'Vacation',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        status: 'Pending',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock employee not found
      mockEmployeesService.findByEmployeeId.mockResolvedValue(null);

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.errorCount).toBe(1);
      expect(result.errors[0].errors[0]).toContain('does not exist');
    });

    it('should detect overlapping leaves', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leaves');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'leave_type', key: 'leave_type', width: 12 },
        { header: 'start_date', key: 'start_date', width: 12 },
        { header: 'end_date', key: 'end_date', width: 12 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        leave_type: 'Vacation',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        status: 'Pending',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock employee exists
      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      // Mock overlap exists
      mockLeaveModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeave),
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.errorCount).toBe(1);
      expect(result.errors[0].errors[0]).toContain('overlaps');
    });

    it('should detect invalid date range', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leaves');

      worksheet.columns = [
        { header: 'employee_id', key: 'employee_id', width: 15 },
        { header: 'leave_type', key: 'leave_type', width: 12 },
        { header: 'start_date', key: 'start_date', width: 12 },
        { header: 'end_date', key: 'end_date', width: 12 },
        { header: 'status', key: 'status', width: 12 },
      ];

      worksheet.addRow({
        employee_id: 'EMP001',
        leave_type: 'Vacation',
        start_date: '2025-01-20',
        end_date: '2025-01-15', // End before start
        status: 'Pending',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock employee exists
      mockEmployeesService.findByEmployeeId.mockResolvedValue({
        employee_id: 'EMP001',
      });

      const result = await service.processExcelUpload(
        Buffer.from(buffer),
        true,
      );

      expect(result.errorCount).toBe(1);
      expect(result.errors[0].errors[0]).toContain('End date');
    });
  });

  describe('exportToExcel', () => {
    it('should export leaves to Excel', async () => {
      const mockRecords = [
        {
          employee_id: 'EMP001',
          leave_type: 'Vacation',
          start_date: new Date('2025-01-15'),
          end_date: new Date('2025-01-20'),
          status: 'Approved',
          reason: 'Family vacation',
        },
      ];

      mockLeaveModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRecords),
        }),
      });

      const buffer = await service.exportToExcel({});

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
