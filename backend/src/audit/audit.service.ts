import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'deactivate';
  changes?: Record<string, any>;
  previous_values?: Record<string, any>;
  performed_by: string;
  reason?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = new this.auditLogModel(dto);
    return auditLog.save();
  }

  async findByEntity(
    entity_type: string,
    entity_id: string,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ entity_type, entity_id })
      .sort({ createdAt: -1 })
      .exec();
  }
}
