/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SalaryRulesService } from './salary-rules.service';
import { SalaryRule } from './schemas/salary-rule.schema';
import { SalaryRuleVersion } from './schemas/salary-rule-version.schema';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('SalaryRulesService', () => {
  let service: SalaryRulesService;

  const mockSalaryRuleModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSalaryRuleVersionModel = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryRulesService,
        {
          provide: getModelToken(SalaryRule.name),
          useValue: mockSalaryRuleModel,
        },
        {
          provide: getModelToken(SalaryRuleVersion.name),
          useValue: mockSalaryRuleVersionModel,
        },
      ],
    }).compile();

    service = module.get<SalaryRulesService>(SalaryRulesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRule', () => {
    it('should create a new salary rule', async () => {
      const createDto = {
        rule_name: 'test-rule',
        description: 'Test Rule',
        employee_category: 'general',
        overtime_multiplier: 1.5,
        standard_hours_per_day: 8,
        working_days_per_month: 22,
        min_working_hours_per_month: 0,
        max_working_hours_per_month: 240,
        default_deduction_percentage: 100,
        deduction_rules: [],
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const savedRule = {
        ...createDto,
        version: 1,
        status: 'draft',
        _id: '123',
      };

      const mockSave = jest.fn().mockResolvedValue(savedRule);

      const SalaryRuleConstructor: any = jest.fn().mockImplementation(() => ({
        ...createDto,
        save: mockSave,
      }));

      // Preserve original methods
      SalaryRuleConstructor.findOne = mockSalaryRuleModel.findOne;
      SalaryRuleConstructor.countDocuments = mockSalaryRuleModel.countDocuments;

      service['salaryRuleModel'] = SalaryRuleConstructor;

      const VersionConstructor: any = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      }));
      service['salaryRuleVersionModel'] = VersionConstructor;

      const result = await service.createRule(createDto);

      expect(result).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ConflictException if rule name already exists', async () => {
      const createDto = {
        rule_name: 'existing-rule',
        employee_category: 'general',
        overtime_multiplier: 1.5,
        standard_hours_per_day: 8,
        working_days_per_month: 22,
        min_working_hours_per_month: 0,
        max_working_hours_per_month: 240,
        default_deduction_percentage: 100,
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ rule_name: 'existing-rule' }),
      });

      await expect(service.createRule(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid overtime multiplier', async () => {
      const createDto = {
        rule_name: 'test-rule',
        employee_category: 'general',
        overtime_multiplier: 5, // Invalid: > 3
        standard_hours_per_day: 8,
        working_days_per_month: 22,
        min_working_hours_per_month: 0,
        max_working_hours_per_month: 240,
        default_deduction_percentage: 100,
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createRule(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getActiveRuleForCategory', () => {
    it('should return active rule for a category', async () => {
      const mockRule = {
        rule_name: 'general-rule',
        employee_category: 'general',
        status: 'active',
        effective_from: new Date('2025-01-01'),
        effective_to: null,
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRule),
        }),
      });

      const result = await service.getActiveRuleForCategory('general');

      expect(result).toBeDefined();
      expect(result).toEqual(mockRule);
    });

    it('should return null if no active rule found', async () => {
      mockSalaryRuleModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.getActiveRuleForCategory('executive');

      expect(result).toBeNull();
    });
  });

  describe('updateRule', () => {
    it('should update a salary rule and create version history', async () => {
      const existingRule = {
        rule_name: 'test-rule',
        version: 1,
        overtime_multiplier: 1.5,
        toObject: jest.fn().mockReturnValue({
          rule_name: 'test-rule',
          version: 1,
          overtime_multiplier: 1.5,
        }),
        save: jest.fn().mockResolvedValue({
          rule_name: 'test-rule',
          version: 2,
          overtime_multiplier: 2.0,
        }),
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingRule),
      });

      const VersionConstructor: any = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      }));
      service['salaryRuleVersionModel'] = VersionConstructor;

      const updateDto = {
        overtime_multiplier: 2.0,
        updated_by: 'admin',
        change_reason: 'Policy update',
      };

      const result = await service.updateRule('test-rule', updateDto);

      expect(existingRule.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if rule does not exist', async () => {
      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateRule('nonexistent', { overtime_multiplier: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated rules', async () => {
      const mockRules = [
        { rule_name: 'rule1', employee_category: 'general' },
        { rule_name: 'rule2', employee_category: 'manager' },
      ];

      mockSalaryRuleModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRules),
            }),
          }),
        }),
      });

      mockSalaryRuleModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockRules);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('deleteRule', () => {
    it('should soft delete a rule by setting status to inactive', async () => {
      const existingRule = {
        rule_name: 'test-rule',
        status: 'active',
        toObject: jest.fn().mockReturnValue({
          rule_name: 'test-rule',
          status: 'active',
        }),
        save: jest.fn().mockResolvedValue({
          rule_name: 'test-rule',
          status: 'inactive',
        }),
      };

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingRule),
      });

      const VersionConstructor: any = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      }));
      service['salaryRuleVersionModel'] = VersionConstructor;

      await service.deleteRule('test-rule', 'admin');

      expect(existingRule.save).toHaveBeenCalled();
    });
  });

  describe('createDefaultRules', () => {
    it('should create default rule if none exist', async () => {
      mockSalaryRuleModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      mockSalaryRuleModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockSave = jest.fn().mockResolvedValue({
        rule_name: 'default-general',
        _id: '123',
      });

      const SalaryRuleConstructor: any = jest.fn().mockImplementation(() => ({
        rule_name: 'default-general',
        version: 1,
        save: mockSave,
      }));

      // Preserve original methods
      SalaryRuleConstructor.findOne = mockSalaryRuleModel.findOne;
      SalaryRuleConstructor.countDocuments = mockSalaryRuleModel.countDocuments;

      service['salaryRuleModel'] = SalaryRuleConstructor;

      const VersionConstructor: any = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      }));
      service['salaryRuleVersionModel'] = VersionConstructor;

      await service.createDefaultRules();

      expect(mockSave).toHaveBeenCalled();
    });

    it('should not create default rule if rules already exist', async () => {
      mockSalaryRuleModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      await service.createDefaultRules();

      // Should not attempt to create any rules
      expect(mockSalaryRuleModel.findOne).not.toHaveBeenCalled();
    });
  });
});
