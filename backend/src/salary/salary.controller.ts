import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto, QuerySalaryDto } from './dto/salary.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('calculate')
  async calculateSalary(
    @Body(ValidationPipe) calculateDto: CalculateSalaryDto,
  ) {
    return this.salaryService.calculateSalary(calculateDto);
  }

  @Get()
  async getSalaryCalculations(@Query(ValidationPipe) query: QuerySalaryDto) {
    return this.salaryService.findAll(query);
  }

  @Get(':employee_id/:period_start/:period_end')
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
    @Body('date') date: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.salaryService.createHoliday(date, name, description);
  }

  @Get('holidays')
  async getHolidays() {
    return this.salaryService.getAllHolidays();
  }

  @Delete('holidays/:date')
  async deleteHoliday(@Param('date') date: string) {
    await this.salaryService.deleteHoliday(date);
    return { message: 'Holiday deleted successfully' };
  }
}
