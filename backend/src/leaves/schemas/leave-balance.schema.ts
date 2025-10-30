import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveBalanceDocument = LeaveBalance & Document;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ required: true, unique: true, index: true })
  employee_id: string;

  @Prop({ required: true, type: Number, default: 20 })
  vacation_balance: number;

  @Prop({ required: true, type: Number, default: 10 })
  sick_balance: number;

  @Prop({ required: true, type: Number, default: 5 })
  personal_balance: number;

  @Prop({ required: true, type: Number, default: 0 })
  vacation_used: number;

  @Prop({ required: true, type: Number, default: 0 })
  sick_used: number;

  @Prop({ required: true, type: Number, default: 0 })
  personal_used: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
