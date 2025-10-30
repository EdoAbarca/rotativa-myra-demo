import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  user_id: string; // HR user who receives the notification

  @Prop({ required: true })
  type: string; // 'absence', 'late', 'overtime'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data?: Record<string, unknown>; // Additional data about the event

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ type: Date })
  read_at?: Date;

  @Prop({ type: String, enum: ['info', 'warning', 'error', 'success'] })
  severity?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Add index for user_id and read status queries
NotificationSchema.index({ user_id: 1, read: 1 });
NotificationSchema.index({ user_id: 1, createdAt: -1 });
