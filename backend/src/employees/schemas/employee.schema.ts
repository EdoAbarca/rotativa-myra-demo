import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true, index: true })
  employee_id: string;

  @Prop({ required: true, index: true })
  first_name: string;

  @Prop({ required: true, index: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, index: true })
  department: string;

  @Prop({ required: true, index: true })
  position: string;

  @Prop({ required: true, type: Number })
  base_salary: number;

  @Prop({ required: true, type: Date, index: true })
  hire_date: Date;

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
    index: true,
  })
  status: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Add compound index for name-based searches (optimizes $or queries on first_name and last_name)
EmployeeSchema.index({ first_name: 1, last_name: 1 });
