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
    getHolidayById: jest.fn(),
    updateHoliday: jest.fn(),
    deleteHoliday: jest.fn(),
    deleteHolidayById: jest.fn(),
    generateRecurringHolidays: jest.fn(),
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
        is_paid: true,
        is_recurring: true,
        recurring_month: 12,
        recurring_day: 25,
      };

      const holidayData = {
        date: new Date('2025-12-25'),
        name: 'Christmas',
        description: 'Christmas Day',
        is_paid: true,
        is_recurring: true,
        recurring_month: 12,
        recurring_day: 25,
      };

      mockSalaryService.createHoliday.mockResolvedValue(holidayData);

      const result = await controller.createHoliday(createHolidayDto);

      expect(mockSalaryService.createHoliday).toHaveBeenCalledWith(
        '2025-12-25',
        'Christmas',
        'Christmas Day',
        true,
        true,
        12,
        25,
      );
      expect(result).toEqual(holidayData);
    });

    it('should get all holidays with filters', async () => {
      const query = {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      };
      const holidays = [{ date: new Date('2025-12-25'), name: 'Christmas' }];

      mockSalaryService.getAllHolidays.mockResolvedValue(holidays);

      const result = await controller.getHolidays(query);

      expect(mockSalaryService.getAllHolidays).toHaveBeenCalledWith(query);
      expect(result).toEqual(holidays);
    });

    it('should get a single holiday by ID', async () => {
      const holiday = { date: new Date('2025-12-25'), name: 'Christmas' };

      mockSalaryService.getHolidayById.mockResolvedValue(holiday);

      const result = await controller.getHoliday('holiday-id-123');

      expect(mockSalaryService.getHolidayById).toHaveBeenCalledWith(
        'holiday-id-123',
      );
      expect(result).toEqual(holiday);
    });

    it('should update a holiday', async () => {
      const updateDto = {
        name: 'Updated Christmas',
        description: 'Updated description',
      };

      const updatedHoliday = {
        date: new Date('2025-12-25'),
        name: 'Updated Christmas',
        description: 'Updated description',
      };

      mockSalaryService.updateHoliday.mockResolvedValue(updatedHoliday);

      const result = await controller.updateHoliday(
        'holiday-id-123',
        updateDto,
      );

      expect(mockSalaryService.updateHoliday).toHaveBeenCalledWith(
        'holiday-id-123',
        updateDto,
      );
      expect(result).toEqual(updatedHoliday);
    });

    it('should delete a holiday', async () => {
      mockSalaryService.deleteHoliday.mockResolvedValue(undefined);

      const result = await controller.deleteHoliday('2025-12-25');

      expect(mockSalaryService.deleteHoliday).toHaveBeenCalledWith(
        '2025-12-25',
      );
      expect(result).toEqual({ message: 'Holiday deleted successfully' });
    });

    it('should delete a holiday by ID', async () => {
      mockSalaryService.deleteHolidayById.mockResolvedValue(undefined);

      const result = await controller.deleteHolidayById('holiday-id-123');

      expect(mockSalaryService.deleteHolidayById).toHaveBeenCalledWith(
        'holiday-id-123',
      );
      expect(result).toEqual({ message: 'Holiday deleted successfully' });
    });

    it('should generate recurring holidays for a year', async () => {
      const holidays = [
        { date: new Date('2025-12-25'), name: 'Christmas' },
        { date: new Date('2025-01-01'), name: 'New Year' },
      ];

      mockSalaryService.generateRecurringHolidays.mockResolvedValue(holidays);

      const result = await controller.generateRecurringHolidays('2025');

      expect(mockSalaryService.generateRecurringHolidays).toHaveBeenCalledWith(
        2025,
      );
      expect(result).toEqual({
        message: 'Generated 2 recurring holidays for 2025',
        holidays,
      });
    });
  });
});
