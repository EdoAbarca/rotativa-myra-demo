import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { SalaryRulesService } from './salary-rules.service';
import { PayrollService } from './payroll.service';
import {
  SalaryCalculation,
  SalaryCalculationSchema,
} from './schemas/salary-calculation.schema';
import { Holiday, HolidaySchema } from './schemas/holiday.schema';
import { SalaryRule, SalaryRuleSchema } from './schemas/salary-rule.schema';
import {
  SalaryRuleVersion,
  SalaryRuleVersionSchema,
} from './schemas/salary-rule-version.schema';
import { Payroll, PayrollSchema } from './schemas/payroll.schema';
import { EmployeesModule } from '../employees/employees.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalaryCalculation.name, schema: SalaryCalculationSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: SalaryRule.name, schema: SalaryRuleSchema },
      { name: SalaryRuleVersion.name, schema: SalaryRuleVersionSchema },
      { name: Payroll.name, schema: PayrollSchema },
    ]),
    EmployeesModule,
    AttendanceModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService, SalaryRulesService, PayrollService],
  exports: [SalaryService, SalaryRulesService, PayrollService],
})
export class SalaryModule {}
