import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalaryRuleVersionDocument = SalaryRuleVersion & Document;

/**
 * Stores historical versions of salary rules for audit trail
 */
@Schema({ timestamps: true })
export class SalaryRuleVersion {
  @Prop({ required: true, index: true })
  rule_name: string;

  @Prop({ required: true, type: Number })
  version: number;

  @Prop({ required: true })
  employee_category: string;

  @Prop({ required: true, type: Number })
  overtime_multiplier: number;

  @Prop({ required: true, type: Number })
  standard_hours_per_day: number;

  @Prop({ required: true, type: Number })
  working_days_per_month: number;

  @Prop({ required: true, type: Number })
  min_working_hours_per_month: number;

  @Prop({ required: true, type: Number })
  max_working_hours_per_month: number;

  @Prop({ type: Array })
  deduction_rules: any[];

  @Prop({ required: true, type: Number })
  default_deduction_percentage: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, type: Date })
  effective_from: Date;

  @Prop({ type: Date })
  effective_to?: Date;

  // Change tracking
  @Prop({ required: true })
  change_type: string; // 'created', 'updated', 'deleted', 'status_changed'

  @Prop({ type: String })
  changed_by?: string;

  @Prop({ type: String })
  change_reason?: string;

  @Prop({ type: Object })
  previous_values?: Record<string, any>;

  @Prop({ type: Object })
  new_values?: Record<string, any>;
}

export const SalaryRuleVersionSchema =
  SchemaFactory.createForClass(SalaryRuleVersion);

// Add compound index for rule name and version lookups
SalaryRuleVersionSchema.index({ rule_name: 1, version: 1 }, { unique: true });
SalaryRuleVersionSchema.index({ createdAt: -1 });
