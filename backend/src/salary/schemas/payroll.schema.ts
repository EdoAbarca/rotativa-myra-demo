import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollDocument = Payroll & Document;

export class EmployeePayrollEntry {
  @Prop({ required: true })
  employee_id: string;

  @Prop({ required: true })
  employee_name: string;

  @Prop({ required: true })
  base_salary: number;

  @Prop({ required: true })
  days_worked: number;

  @Prop({ required: true })
  working_days_in_period: number;

  @Prop({ default: 0 })
  absent_days: number;

  @Prop({ default: 0 })
  overtime_hours: number;

  @Prop({ default: 0 })
  holiday_days: number;

  @Prop({ required: true })
  daily_rate: number;

  @Prop({ required: true })
  hourly_rate: number;

  @Prop({ required: true })
  overtime_rate: number;

  @Prop({ required: true })
  base_salary_earned: number;

  @Prop({ default: 0 })
  overtime_earnings: number;

  @Prop({ default: 0 })
  absence_deductions: number;

  @Prop({ required: true })
  total_salary: number;

  @Prop({ type: [String], default: [] })
  warnings: string[];

  @Prop({ default: false })
  has_incomplete_data: boolean;
}

@Schema({ timestamps: true })
export class Payroll {
  @Prop({ required: true, index: true })
  month: number; // 1-12

  @Prop({ required: true, index: true })
  year: number;

  @Prop({ required: true, type: Date })
  period_start: Date;

  @Prop({ required: true, type: Date })
  period_end: Date;

  @Prop({ required: true, type: Number })
  total_employees: number;

  @Prop({ required: true, type: Number })
  employees_with_incomplete_data: number;

  @Prop({ required: true, type: Number })
  total_base_salary: number;

  @Prop({ required: true, type: Number })
  total_overtime: number;

  @Prop({ required: true, type: Number })
  total_deductions: number;

  @Prop({ required: true, type: Number })
  total_payroll: number;

  @Prop({ type: [EmployeePayrollEntry], default: [] })
  employee_entries: EmployeePayrollEntry[];

  @Prop({ type: String })
  generated_by?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({
    type: String,
    enum: ['draft', 'finalized', 'paid'],
    default: 'finalized',
  })
  status: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);

// Add compound index for month/year lookups
PayrollSchema.index({ year: 1, month: 1 }, { unique: true });
