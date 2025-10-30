import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AbsenceAlertDocument = AbsenceAlert & Document;

@Schema({ timestamps: true })
export class AbsenceAlert {
  @Prop({ required: true, index: true })
  employee_id: string;

  @Prop({ required: true, type: Date, index: true })
  absence_date: Date;

  @Prop({
    required: true,
    enum: ['unexcused', 'excused', 'pending_review'],
    default: 'unexcused',
    index: true,
  })
  status: string;

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  reviewed_by?: string;

  @Prop({ type: Date })
  reviewed_at?: Date;

  @Prop({ type: Boolean, default: false })
  notification_sent: boolean;

  @Prop({ type: [String], default: [] })
  notification_channels: string[]; // ['email', 'in_app']
}

export const AbsenceAlertSchema = SchemaFactory.createForClass(AbsenceAlert);

// Add compound index for employee and date lookups
AbsenceAlertSchema.index({ employee_id: 1, absence_date: 1 }, { unique: true });
