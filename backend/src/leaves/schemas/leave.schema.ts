import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveDocument = Leave & Document;

@Schema({ timestamps: true })
export class Leave {
  @Prop({ required: true, index: true })
  employee_id: string;

  @Prop({
    required: true,
    enum: ['Vacation', 'Sick', 'Personal'],
    index: true,
  })
  leave_type: string;

  @Prop({ required: true, type: Date, index: true })
  start_date: Date;

  @Prop({ required: true, type: Date, index: true })
  end_date: Date;

  @Prop({
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  })
  status: string;

  @Prop({ type: String })
  reason?: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);

// Add compound index for employee and date range lookups
LeaveSchema.index({ employee_id: 1, start_date: 1, end_date: 1 });
