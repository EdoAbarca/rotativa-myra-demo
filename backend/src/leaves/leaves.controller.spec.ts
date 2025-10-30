import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { BadRequestException } from '@nestjs/common';

describe('LeavesController', () => {
  let controller: LeavesController;

  const mockLeavesService = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    getLeaveBalance: jest.fn(),
    getAllLeaveBalances: jest.fn(),
    processExcelUpload: jest.fn(),
    exportToExcel: jest.fn(),
    exportBalancesToExcel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [
        {
          provide: LeavesService,
          useValue: mockLeavesService,
        },
      ],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all leaves when no query params', async () => {
      const mockLeaves = [
        {
          employee_id: 'EMP001',
          leave_type: 'Vacation',
          start_date: new Date('2025-01-15'),
          end_date: new Date('2025-01-20'),
          status: 'Approved',
        },
      ];

      mockLeavesService.findAll.mockResolvedValue(mockLeaves);

      const result = await controller.findAll({});
      expect(result).toEqual(mockLeaves);
      expect(mockLeavesService.findAll).toHaveBeenCalled();
    });

    it('should return paginated leaves when query params provided', async () => {
      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockLeavesService.findAllPaginated.mockResolvedValue(mockResult);

      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockResult);
      expect(mockLeavesService.findAllPaginated).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should throw error if employee_id not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(controller.getBalance(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return leave balance for employee', async () => {
      const mockBalance = {
        employee_id: 'EMP001',
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5,
        vacation_used: 5,
        sick_used: 2,
        personal_used: 1,
      };

      mockLeavesService.getLeaveBalance.mockResolvedValue(mockBalance);

      const result = await controller.getBalance('EMP001');
      expect(result).toEqual(mockBalance);
    });
  });

  describe('getAllBalances', () => {
    it('should return all leave balances', async () => {
      const mockBalances = [
        {
          employee_id: 'EMP001',
          vacation_balance: 20,
          sick_balance: 10,
          personal_balance: 5,
          vacation_used: 5,
          sick_used: 2,
          personal_used: 1,
        },
        {
          employee_id: 'EMP002',
          vacation_balance: 20,
          sick_balance: 10,
          personal_balance: 5,
          vacation_used: 0,
          sick_used: 0,
          personal_used: 0,
        },
      ];

      mockLeavesService.getAllLeaveBalances.mockResolvedValue(mockBalances);

      const result = await controller.getAllBalances();
      expect(result).toEqual(mockBalances);
      expect(mockLeavesService.getAllLeaveBalances).toHaveBeenCalled();
    });
  });

  describe('exportBalancesToExcel', () => {
    it('should export leave balances to Excel', async () => {
      const mockBuffer = Buffer.from('test excel data');
      mockLeavesService.exportBalancesToExcel.mockResolvedValue(mockBuffer);

      const mockResponse = {
        set: jest.fn(),
      };

      const result = await controller.exportBalancesToExcel(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        mockResponse as any,
      );
      expect(result).toBeInstanceOf(Object);
      expect(mockLeavesService.exportBalancesToExcel).toHaveBeenCalled();
    });
  });

  describe('uploadExcel', () => {
    it('should throw error if no file uploaded', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        controller.uploadExcel(undefined as any, undefined),
      ).rejects.toThrow('No file uploaded');
    });

    it('should process Excel file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.xlsx',
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        message: 'Success',
        successCount: 1,
        errorCount: 0,
        errors: [],
        created: 1,
        updated: 0,
      };

      mockLeavesService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile, undefined);
      expect(result).toEqual(mockResult);
      expect(mockLeavesService.processExcelUpload).toHaveBeenCalledWith(
        mockFile.buffer,
        false,
      );
    });

    it('should process Excel file in preview mode', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.xlsx',
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        message: 'Preview: 1 records ready to import',
        successCount: 1,
        errorCount: 0,
        errors: [],
        created: 0,
        updated: 0,
        preview: [],
      };

      mockLeavesService.processExcelUpload.mockResolvedValue(mockResult);

      const result = await controller.uploadExcel(mockFile, 'true');
      expect(result).toEqual(mockResult);
      expect(mockLeavesService.processExcelUpload).toHaveBeenCalledWith(
        mockFile.buffer,
        true,
      );
    });
  });
});
