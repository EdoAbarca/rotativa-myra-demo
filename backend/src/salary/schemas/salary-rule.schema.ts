import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalaryRuleDocument = SalaryRule & Document;

/**
 * Deduction rule for different absence types
 */
export class DeductionRule {
  @Prop({ required: true })
  absence_type: string; // e.g., 'unexcused', 'excused', 'medical'

  @Prop({ required: true, type: Number })
  deduction_percentage: number; // Percentage of daily rate (0-100)
}

/**
 * Salary calculation rules for a specific employee category
 */
@Schema({ timestamps: true })
export class SalaryRule {
  @Prop({ required: true, unique: true, index: true })
  rule_name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, default: 'general' })
  employee_category: string; // e.g., 'general', 'manager', 'executive', 'intern'

  // Overtime configuration
  @Prop({ required: true, type: Number, default: 1.5 })
  overtime_multiplier: number; // e.g., 1.5 for 1.5x base rate

  // Working hours configuration
  @Prop({ required: true, type: Number, default: 8 })
  standard_hours_per_day: number;

  @Prop({ required: true, type: Number, default: 22 })
  working_days_per_month: number;

  @Prop({ required: true, type: Number, default: 0 })
  min_working_hours_per_month: number;

  @Prop({ required: true, type: Number, default: 240 })
  max_working_hours_per_month: number; // e.g., 22 days * 8 hours + reasonable overtime

  // Deduction rules for different absence types
  @Prop({ type: [DeductionRule], default: [] })
  deduction_rules: DeductionRule[];

  // Default deduction percentage if absence type not specified
  @Prop({ required: true, type: Number, default: 100 })
  default_deduction_percentage: number;

  // Rule status
  @Prop({
    required: true,
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
    index: true,
  })
  status: string;

  // Effective dates
  @Prop({ required: true, type: Date, default: Date.now })
  effective_from: Date;

  @Prop({ type: Date })
  effective_to?: Date;

  // Version tracking
  @Prop({ required: true, type: Number, default: 1 })
  version: number;

  // Audit information
  @Prop({ type: String })
  created_by?: string;

  @Prop({ type: String })
  updated_by?: string;
}

export const SalaryRuleSchema = SchemaFactory.createForClass(SalaryRule);

// Add indexes for efficient queries
SalaryRuleSchema.index({ employee_category: 1, status: 1 });
SalaryRuleSchema.index({ effective_from: 1, effective_to: 1 });
