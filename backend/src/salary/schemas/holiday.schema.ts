import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true, type: Date, index: true })
  date: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, default: true })
  is_paid: boolean;

  @Prop({ type: Boolean, default: false })
  is_recurring: boolean;

  @Prop({ type: Number })
  recurring_month?: number; // 1-12 for Jan-Dec

  @Prop({ type: Number })
  recurring_day?: number; // 1-31 for day of month
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
