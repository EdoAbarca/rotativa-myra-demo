import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true, index: true })
  employee_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true, type: Number })
  base_salary: number;

  @Prop({ required: true, type: Date })
  hire_date: Date;

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
  })
  status: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
