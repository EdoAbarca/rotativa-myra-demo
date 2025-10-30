import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalaryCalculationDocument = SalaryCalculation & Document;

@Schema({ timestamps: true })
export class SalaryCalculation {
  @Prop({ required: true, index: true })
  employee_id: string;

  @Prop({ required: true, type: Date, index: true })
  period_start: Date;

  @Prop({ required: true, type: Date, index: true })
  period_end: Date;

  @Prop({ required: true, type: Number })
  base_salary: number;

  @Prop({ required: true, type: Number })
  working_days_in_period: number;

  @Prop({ required: true, type: Number, default: 0 })
  days_worked: number;

  @Prop({ required: true, type: Number, default: 0 })
  absent_days: number;

  @Prop({ required: true, type: Number, default: 0 })
  holiday_days: number;

  @Prop({ required: true, type: Number, default: 0 })
  approved_leave_days: number;

  @Prop({ required: true, type: Number, default: 0 })
  overtime_hours: number;

  @Prop({ required: true, type: Number })
  daily_rate: number;

  @Prop({ required: true, type: Number })
  hourly_rate: number;

  @Prop({ required: true, type: Number })
  overtime_rate: number;

  @Prop({ required: true, type: Number, default: 0 })
  base_salary_earned: number;

  @Prop({ required: true, type: Number, default: 0 })
  overtime_earnings: number;

  @Prop({ required: true, type: Number, default: 0 })
  absence_deductions: number;

  @Prop({ required: true, type: Number })
  total_salary: number;

  @Prop({ type: String })
  notes?: string;
}

export const SalaryCalculationSchema =
  SchemaFactory.createForClass(SalaryCalculation);

// Add compound index for employee and period lookups
SalaryCalculationSchema.index(
  { employee_id: 1, period_start: 1, period_end: 1 },
  { unique: true },
);
