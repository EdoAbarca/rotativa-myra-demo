import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  Delete,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SalaryService } from './salary.service';
import { SalaryRulesService } from './salary-rules.service';
import { PayrollService } from './payroll.service';
import { CalculateSalaryDto, QuerySalaryDto } from './dto/salary.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { QueryHolidaysDto } from './dto/query-holidays.dto';
import {
  CreateSalaryRuleDto,
  UpdateSalaryRuleDto,
  QuerySalaryRulesDto,
} from './dto/salary-rule.dto';
import { GeneratePayrollDto, QueryPayrollDto } from './dto/payroll.dto';

@Controller('salary')
export class SalaryController {
  constructor(
    private readonly salaryService: SalaryService,
    private readonly salaryRulesService: SalaryRulesService,
    private readonly payrollService: PayrollService,
  ) {}

  @Post('calculate')
  async calculateSalary(
    @Body(ValidationPipe) calculateDto: CalculateSalaryDto,
  ) {
    return this.salaryService.calculateSalary(calculateDto);
  }

  @Get('calculations')
  async getSalaryCalculations(@Query(ValidationPipe) query: QuerySalaryDto) {
    return this.salaryService.findAll(query);
  }

  @Get('calculations/:employee_id/:period_start/:period_end')
  async getSalaryByEmployeeAndPeriod(
    @Param('employee_id') employee_id: string,
    @Param('period_start') period_start: string,
    @Param('period_end') period_end: string,
  ) {
    return this.salaryService.findByEmployeeAndPeriod(
      employee_id,
      period_start,
      period_end,
    );
  }

  // Salary Rules endpoints
  @Post('rules')
  async createSalaryRule(@Body(ValidationPipe) createDto: CreateSalaryRuleDto) {
    return this.salaryRulesService.createRule(createDto);
  }

  @Get('rules')
  async getSalaryRules(@Query(ValidationPipe) query: QuerySalaryRulesDto) {
    return this.salaryRulesService.findAll(query);
  }

  @Get('rules/:ruleName')
  async getSalaryRule(@Param('ruleName') ruleName: string) {
    return this.salaryRulesService.findByName(ruleName);
  }

  @Put('rules/:ruleName')
  async updateSalaryRule(
    @Param('ruleName') ruleName: string,
    @Body(ValidationPipe) updateDto: UpdateSalaryRuleDto,
  ) {
    return this.salaryRulesService.updateRule(ruleName, updateDto);
  }

  @Delete('rules/:ruleName')
  async deleteSalaryRule(
    @Param('ruleName') ruleName: string,
    @Query('deletedBy') deletedBy?: string,
  ) {
    await this.salaryRulesService.deleteRule(ruleName, deletedBy);
    return { message: 'Salary rule deleted successfully' };
  }

  @Get('rules/:ruleName/versions')
  async getSalaryRuleVersions(@Param('ruleName') ruleName: string) {
    return this.salaryRulesService.getVersionHistory(ruleName);
  }

  @Post('rules/initialize-defaults')
  async initializeDefaultRules() {
    await this.salaryRulesService.createDefaultRules();
    return { message: 'Default salary rules initialized successfully' };
  }

  // Holiday endpoints
  @Post('holidays')
  async createHoliday(
    @Body(ValidationPipe) createHolidayDto: CreateHolidayDto,
  ) {
    return this.salaryService.createHoliday(
      createHolidayDto.date,
      createHolidayDto.name,
      createHolidayDto.description,
      createHolidayDto.is_paid,
      createHolidayDto.is_recurring,
      createHolidayDto.recurring_month,
      createHolidayDto.recurring_day,
    );
  }

  @Get('holidays')
  async getHolidays(@Query(ValidationPipe) query: QueryHolidaysDto) {
    return this.salaryService.getAllHolidays(query);
  }

  @Get('holidays/:id')
  async getHoliday(@Param('id') id: string) {
    return this.salaryService.getHolidayById(id);
  }

  @Put('holidays/:id')
  async updateHoliday(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.salaryService.updateHoliday(id, updateHolidayDto);
  }

  @Delete('holidays/:date')
  async deleteHoliday(@Param('date') date: string) {
    await this.salaryService.deleteHoliday(date);
    return { message: 'Holiday deleted successfully' };
  }

  @Delete('holidays/by-id/:id')
  async deleteHolidayById(@Param('id') id: string) {
    await this.salaryService.deleteHolidayById(id);
    return { message: 'Holiday deleted successfully' };
  }

  @Post('holidays/generate/:year')
  async generateRecurringHolidays(@Param('year') year: string) {
    const yearNum = parseInt(year, 10);
    const holidays =
      await this.salaryService.generateRecurringHolidays(yearNum);
    return {
      message: `Generated ${holidays.length} recurring holidays for ${year}`,
      holidays,
    };
  }

  // Payroll endpoints
  @Post('payroll/generate')
  async generatePayroll(@Body(ValidationPipe) generateDto: GeneratePayrollDto) {
    return this.payrollService.generatePayroll(generateDto);
  }

  @Get('payroll')
  async getPayrolls(@Query(ValidationPipe) query: QueryPayrollDto) {
    return this.payrollService.findAll(query);
  }

  @Get('payroll/:year/:month')
  async getPayrollByMonthYear(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.payrollService.findByMonthYear(parseInt(month), parseInt(year));
  }

  @Get('payroll/:year/:month/export')
  async exportPayrollToExcel(
    @Param('year') year: string,
    @Param('month') month: string,
    @Res() res: Response,
  ) {
    const buffer = await this.payrollService.exportToExcel(
      parseInt(month),
      parseInt(year),
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=payroll-${year}-${month}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Delete('payroll/:year/:month')
  async deletePayroll(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    await this.payrollService.delete(parseInt(month), parseInt(year));
    return { message: 'Payroll deleted successfully' };
  }
}
