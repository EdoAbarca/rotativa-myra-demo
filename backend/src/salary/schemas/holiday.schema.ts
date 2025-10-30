import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true, type: Date, unique: true, index: true })
  date: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, default: true })
  is_paid: boolean;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
