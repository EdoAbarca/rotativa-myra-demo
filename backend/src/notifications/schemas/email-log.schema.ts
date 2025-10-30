import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailLogDocument = EmailLog & Document;

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  QUEUED = 'queued',
}

@Schema({ timestamps: true })
export class EmailLog {
  @Prop({ required: true, index: true })
  recipient: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  template: string; // Template name used

  @Prop({ type: Object })
  template_data: Record<string, unknown>; // Data passed to template

  @Prop({ 
    type: String, 
    enum: Object.values(EmailStatus),
    default: EmailStatus.PENDING,
    index: true 
  })
  status: EmailStatus;

  @Prop()
  sent_at?: Date;

  @Prop()
  error_message?: string;

  @Prop({ default: 0 })
  retry_count: number;

  @Prop()
  next_retry_at?: Date;

  @Prop({ type: String })
  message_id?: string; // Email service message ID

  @Prop({ type: String, index: true })
  user_id?: string; // Associated user ID
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);

// Index for querying pending/failed emails that need retry
EmailLogSchema.index({ status: 1, next_retry_at: 1 });
// Index for querying emails by user
EmailLogSchema.index({ user_id: 1, createdAt: -1 });
