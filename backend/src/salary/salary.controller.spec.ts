import { Test, TestingModule } from '@nestjs/testing';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';

describe('SalaryController', () => {
  let controller: SalaryController;

  const mockSalaryService = {
    calculateSalary: jest.fn(),
    findAll: jest.fn(),
    findByEmployeeAndPeriod: jest.fn(),
    createHoliday: jest.fn(),
    getAllHolidays: jest.fn(),
    deleteHoliday: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryController],
      providers: [
        {
          provide: SalaryService,
          useValue: mockSalaryService,
        },
      ],
    }).compile();

    controller = module.get<SalaryController>(SalaryController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculateSalary', () => {
    it('should calculate salary for an employee', async () => {
      const calculateDto = {
        employee_id: 'EMP001',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      };

      const expectedResult = {
        employee_id: 'EMP001',
        total_salary: 44000,
      };

      mockSalaryService.calculateSalary.mockResolvedValue(expectedResult);

      const result = await controller.calculateSalary(calculateDto);

      expect(mockSalaryService.calculateSalary).toHaveBeenCalledWith(
        calculateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSalaryCalculations', () => {
    it('should return paginated salary calculations', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockSalaryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getSalaryCalculations(query);

      expect(mockSalaryService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSalaryByEmployeeAndPeriod', () => {
    it('should return salary calculation for specific employee and period', async () => {
      const employee_id = 'EMP001';
      const period_start = '2025-01-01';
      const period_end = '2025-01-31';

      const expectedResult = {
        employee_id: 'EMP001',
        total_salary: 44000,
      };

      mockSalaryService.findByEmployeeAndPeriod.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getSalaryByEmployeeAndPeriod(
        employee_id,
        period_start,
        period_end,
      );

      expect(mockSalaryService.findByEmployeeAndPeriod).toHaveBeenCalledWith(
        employee_id,
        period_start,
        period_end,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Holiday Management', () => {
    it('should create a holiday', async () => {
      const createHolidayDto = {
        date: '2025-12-25',
        name: 'Christmas',
        description: 'Christmas Day',
      };

      const holidayData = {
        date: new Date('2025-12-25'),
        name: 'Christmas',
        description: 'Christmas Day',
      };

      mockSalaryService.createHoliday.mockResolvedValue(holidayData);

      const result = await controller.createHoliday(createHolidayDto);

      expect(mockSalaryService.createHoliday).toHaveBeenCalledWith(
        '2025-12-25',
        'Christmas',
        'Christmas Day',
      );
      expect(result).toEqual(holidayData);
    });

    it('should get all holidays', async () => {
      const holidays = [{ date: new Date('2025-12-25'), name: 'Christmas' }];

      mockSalaryService.getAllHolidays.mockResolvedValue(holidays);

      const result = await controller.getHolidays();

      expect(mockSalaryService.getAllHolidays).toHaveBeenCalled();
      expect(result).toEqual(holidays);
    });

    it('should delete a holiday', async () => {
      mockSalaryService.deleteHoliday.mockResolvedValue(undefined);

      const result = await controller.deleteHoliday('2025-12-25');

      expect(mockSalaryService.deleteHoliday).toHaveBeenCalledWith(
        '2025-12-25',
      );
      expect(result).toEqual({ message: 'Holiday deleted successfully' });
    });
  });
});
