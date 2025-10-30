import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationPreferenceDocument = NotificationPreference & Document;

@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({ required: true, unique: true, index: true })
  user_id: string; // HR employee user ID

  @Prop({ type: Boolean, default: true })
  email_enabled: boolean;

  @Prop({ type: Boolean, default: true })
  in_app_enabled: boolean;

  @Prop({ type: String })
  email_address?: string;

  @Prop({ type: [String], default: [] })
  notification_types: string[]; // e.g., ['absence', 'late', 'overtime']
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);
