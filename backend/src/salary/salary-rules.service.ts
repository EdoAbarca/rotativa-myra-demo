import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalaryRule, SalaryRuleDocument } from './schemas/salary-rule.schema';
import {
  SalaryRuleVersion,
  SalaryRuleVersionDocument,
} from './schemas/salary-rule-version.schema';
import {
  CreateSalaryRuleDto,
  UpdateSalaryRuleDto,
  QuerySalaryRulesDto,
} from './dto/salary-rule.dto';

@Injectable()
export class SalaryRulesService {
  constructor(
    @InjectModel(SalaryRule.name)
    private salaryRuleModel: Model<SalaryRuleDocument>,
    @InjectModel(SalaryRuleVersion.name)
    private salaryRuleVersionModel: Model<SalaryRuleVersionDocument>,
  ) {}

  /**
   * Create a new salary rule with validation
   */
  async createRule(createDto: CreateSalaryRuleDto): Promise<SalaryRule> {
    // Validate rule configuration
    this.validateRuleConfiguration(createDto);

    // Check if rule with same name already exists
    const existing = await this.salaryRuleModel
      .findOne({ rule_name: createDto.rule_name })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Salary rule with name '${createDto.rule_name}' already exists`,
      );
    }

    // Create the rule
    const rule = new this.salaryRuleModel({
      ...createDto,
      version: 1,
      status: createDto.status || 'draft',
      effective_from: createDto.effective_from
        ? new Date(createDto.effective_from)
        : new Date(),
      effective_to: createDto.effective_to
        ? new Date(createDto.effective_to)
        : undefined,
    });

    const saved = await rule.save();

    // Create version history entry
    await this.createVersionHistory(saved, 'created', createDto.created_by);

    return saved;
  }

  /**
   * Update an existing salary rule
   */
  async updateRule(
    ruleName: string,
    updateDto: UpdateSalaryRuleDto,
  ): Promise<SalaryRule> {
    const rule = await this.salaryRuleModel.findOne({ rule_name: ruleName }).exec();

    if (!rule) {
      throw new NotFoundException(`Salary rule '${ruleName}' not found`);
    }

    // Validate updated configuration
    const updatedConfig = { ...rule.toObject(), ...updateDto };
    this.validateRuleConfiguration(updatedConfig);

    // Store previous values for audit
    const previousValues = rule.toObject();

    // Update the rule
    Object.assign(rule, updateDto);
    rule.version += 1;
    rule.updated_by = updateDto.updated_by;

    const saved = await rule.save();

    // Create version history entry
    await this.createVersionHistory(
      saved,
      'updated',
      updateDto.updated_by,
      updateDto.change_reason,
      previousValues,
      updateDto,
    );

    return saved;
  }

  /**
   * Get all salary rules with optional filtering
   */
  async findAll(query: QuerySalaryRulesDto) {
    const {
      employee_category,
      status,
      effective_date,
      page = 1,
      limit = 10,
    } = query;

    const filter: Record<string, any> = {};

    if (employee_category) {
      filter.employee_category = employee_category;
    }

    if (status) {
      filter.status = status;
    }

    if (effective_date) {
      const date = new Date(effective_date);
      filter.effective_from = { $lte: date };
      filter.$or = [{ effective_to: { $gte: date } }, { effective_to: null }];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.salaryRuleModel
        .find(filter)
        .sort({ employee_category: 1, effective_from: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.salaryRuleModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific salary rule by name
   */
  async findByName(ruleName: string): Promise<SalaryRule> {
    const rule = await this.salaryRuleModel.findOne({ rule_name: ruleName }).exec();

    if (!rule) {
      throw new NotFoundException(`Salary rule '${ruleName}' not found`);
    }

    return rule;
  }

  /**
   * Get active rule for a specific employee category
   */
  async getActiveRuleForCategory(
    category: string,
    effectiveDate?: Date,
  ): Promise<SalaryRule | null> {
    const date = effectiveDate || new Date();

    const rule = await this.salaryRuleModel
      .findOne({
        employee_category: category,
        status: 'active',
        effective_from: { $lte: date },
        $or: [{ effective_to: { $gte: date } }, { effective_to: null }],
      })
      .sort({ effective_from: -1 })
      .exec();

    return rule;
  }

  /**
   * Delete a salary rule (soft delete by setting status to inactive)
   */
  async deleteRule(ruleName: string, deletedBy?: string): Promise<void> {
    const rule = await this.salaryRuleModel.findOne({ rule_name: ruleName }).exec();

    if (!rule) {
      throw new NotFoundException(`Salary rule '${ruleName}' not found`);
    }

    // Store previous values for audit
    const previousValues = rule.toObject();

    rule.status = 'inactive';
    rule.effective_to = new Date();
    rule.updated_by = deletedBy;

    await rule.save();

    // Create version history entry
    await this.createVersionHistory(
      rule,
      'deleted',
      deletedBy,
      'Rule deleted',
      previousValues,
      { status: 'inactive', effective_to: rule.effective_to },
    );
  }

  /**
   * Get version history for a rule
   */
  async getVersionHistory(ruleName: string): Promise<SalaryRuleVersion[]> {
    return this.salaryRuleVersionModel
      .find({ rule_name: ruleName })
      .sort({ version: -1 })
      .exec();
  }

  /**
   * Validate rule configuration
   */
  private validateRuleConfiguration(config: any): void {
    // Validate overtime multiplier
    if (config.overtime_multiplier < 1 || config.overtime_multiplier > 3) {
      throw new BadRequestException(
        'Overtime multiplier must be between 1 and 3',
      );
    }

    // Validate standard hours per day
    if (
      config.standard_hours_per_day < 1 ||
      config.standard_hours_per_day > 24
    ) {
      throw new BadRequestException(
        'Standard hours per day must be between 1 and 24',
      );
    }

    // Validate working days per month
    if (
      config.working_days_per_month < 1 ||
      config.working_days_per_month > 31
    ) {
      throw new BadRequestException(
        'Working days per month must be between 1 and 31',
      );
    }

    // Validate min/max working hours
    if (config.min_working_hours_per_month < 0) {
      throw new BadRequestException(
        'Minimum working hours per month cannot be negative',
      );
    }

    if (config.max_working_hours_per_month < 0) {
      throw new BadRequestException(
        'Maximum working hours per month cannot be negative',
      );
    }

    if (
      config.min_working_hours_per_month > config.max_working_hours_per_month
    ) {
      throw new BadRequestException(
        'Minimum working hours cannot exceed maximum working hours',
      );
    }

    // Validate deduction percentages
    if (
      config.default_deduction_percentage < 0 ||
      config.default_deduction_percentage > 100
    ) {
      throw new BadRequestException(
        'Default deduction percentage must be between 0 and 100',
      );
    }

    // Validate deduction rules
    if (config.deduction_rules && config.deduction_rules.length > 0) {
      for (const rule of config.deduction_rules) {
        if (rule.deduction_percentage < 0 || rule.deduction_percentage > 100) {
          throw new BadRequestException(
            `Deduction percentage for '${rule.absence_type}' must be between 0 and 100`,
          );
        }
      }
    }

    // Validate effective dates
    if (config.effective_from && config.effective_to) {
      const from = new Date(config.effective_from);
      const to = new Date(config.effective_to);
      if (from > to) {
        throw new BadRequestException(
          'Effective from date cannot be after effective to date',
        );
      }
    }
  }

  /**
   * Create version history entry
   */
  private async createVersionHistory(
    rule: SalaryRule,
    changeType: string,
    changedBy?: string,
    changeReason?: string,
    previousValues?: any,
    newValues?: any,
  ): Promise<SalaryRuleVersion> {
    const version = new this.salaryRuleVersionModel({
      rule_name: rule.rule_name,
      version: rule.version,
      employee_category: rule.employee_category,
      overtime_multiplier: rule.overtime_multiplier,
      standard_hours_per_day: rule.standard_hours_per_day,
      working_days_per_month: rule.working_days_per_month,
      min_working_hours_per_month: rule.min_working_hours_per_month,
      max_working_hours_per_month: rule.max_working_hours_per_month,
      deduction_rules: rule.deduction_rules,
      default_deduction_percentage: rule.default_deduction_percentage,
      status: rule.status,
      effective_from: rule.effective_from,
      effective_to: rule.effective_to,
      change_type: changeType,
      changed_by: changedBy,
      change_reason: changeReason,
      previous_values: previousValues,
      new_values: newValues,
    });

    return version.save();
  }

  /**
   * Create default salary rules if none exist
   */
  async createDefaultRules(): Promise<void> {
    const count = await this.salaryRuleModel.countDocuments().exec();

    if (count === 0) {
      // Create default rule for general employees
      await this.createRule({
        rule_name: 'default-general',
        description: 'Default salary calculation rules for general employees',
        employee_category: 'general',
        overtime_multiplier: 1.5,
        standard_hours_per_day: 8,
        working_days_per_month: 22,
        min_working_hours_per_month: 0,
        max_working_hours_per_month: 240,
        default_deduction_percentage: 100,
        deduction_rules: [
          { absence_type: 'unexcused', deduction_percentage: 100 },
          { absence_type: 'excused', deduction_percentage: 0 },
          { absence_type: 'medical', deduction_percentage: 50 },
        ],
        status: 'active',
        created_by: 'system',
      });
    }
  }
}
