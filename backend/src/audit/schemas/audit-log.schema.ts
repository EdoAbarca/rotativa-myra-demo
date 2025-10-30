import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  entity_type: string;

  @Prop({ required: true })
  entity_id: string;

  @Prop({ required: true, enum: ['create', 'update', 'deactivate'] })
  action: string;

  @Prop({ type: Object })
  changes: Record<string, any>;

  @Prop({ type: Object })
  previous_values: Record<string, any>;

  @Prop({ required: true })
  performed_by: string;

  @Prop()
  reason: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
