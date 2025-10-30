import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ required: true, index: true })
  employee_id: string;

  @Prop({ required: true, type: Date, index: true })
  date: Date;

  @Prop({
    required: true,
    enum: ['Present', 'Absent', 'Late'],
    index: true,
  })
  status: string;

  @Prop({ type: String })
  check_in_time?: string;

  @Prop({ type: String })
  check_out_time?: string;

  @Prop({ type: Number, default: 0 })
  hours_worked: number;

  @Prop({ type: Number, default: 0 })
  overtime_hours: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Add compound index for employee and date lookups
AttendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });
