import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import {
  SalaryCalculation,
  SalaryCalculationSchema,
} from './schemas/salary-calculation.schema';
import { Holiday, HolidaySchema } from './schemas/holiday.schema';
import { EmployeesModule } from '../employees/employees.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalaryCalculation.name, schema: SalaryCalculationSchema },
      { name: Holiday.name, schema: HolidaySchema },
    ]),
    EmployeesModule,
    AttendanceModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
