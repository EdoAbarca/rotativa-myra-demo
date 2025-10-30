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
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto, QuerySalaryDto } from './dto/salary.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { QueryHolidaysDto } from './dto/query-holidays.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

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
}
