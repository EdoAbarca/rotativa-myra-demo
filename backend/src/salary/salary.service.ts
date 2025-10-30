import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SalaryCalculation,
  SalaryCalculationDocument,
} from './schemas/salary-calculation.schema';
import { Holiday, HolidayDocument } from './schemas/holiday.schema';
import { EmployeesService } from '../employees/employees.service';
import { AttendanceService } from '../attendance/attendance.service';
import { CalculateSalaryDto, QuerySalaryDto } from './dto/salary.dto';

@Injectable()
export class SalaryService {
  // Standard working hours per day
  private readonly STANDARD_HOURS_PER_DAY = 8;
  // Overtime rate multiplier
  private readonly OVERTIME_RATE_MULTIPLIER = 1.5;
  // Working days per month (average)
  private readonly WORKING_DAYS_PER_MONTH = 22;

  constructor(
    @InjectModel(SalaryCalculation.name)
    private salaryCalculationModel: Model<SalaryCalculationDocument>,
    @InjectModel(Holiday.name)
    private holidayModel: Model<HolidayDocument>,
    private employeesService: EmployeesService,
    private attendanceService: AttendanceService,
  ) {}

  /**
   * Calculate monthly salary for an employee
   */
  async calculateSalary(
    calculateDto: CalculateSalaryDto,
  ): Promise<SalaryCalculation> {
    const { employee_id, period_start, period_end, notes } = calculateDto;

    // Validate employee exists
    const employee = await this.employeesService.findByEmployeeId(employee_id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    const startDate = new Date(period_start);
    const endDate = new Date(period_end);

    // Calculate working days in the period (excluding weekends)
    const workingDaysInPeriod = this.calculateWorkingDays(startDate, endDate);

    // Get holidays in the period
    const holidays = await this.getHolidaysInPeriod(startDate, endDate);
    const holidayDays = holidays.length;

    // Get attendance records for the period
    const attendanceRecords = await this.attendanceService.findAllPaginated({
      employee_id,
      start_date: period_start,
      end_date: period_end,
      limit: 1000, // Get all records
    });

    // Calculate attendance statistics
    const presentDays = attendanceRecords.data.filter(
      (a) => a.status === 'Present' || a.status === 'Late',
    ).length;

    const absentDays = attendanceRecords.data.filter(
      (a) => a.status === 'Absent',
    ).length;

    // Calculate overtime hours
    const overtimeHours = attendanceRecords.data.reduce(
      (sum, record) => sum + (record.overtime_hours || 0),
      0,
    );

    // For now, we'll assume approved leave days are 0
    // In a real system, this would come from a leave management system
    const approvedLeaveDays = 0;

    // Calculate rates
    const dailyRate = this.calculateDailyRate(employee.base_salary);
    const hourlyRate = this.calculateHourlyRate(employee.base_salary);
    const overtimeRate = hourlyRate * this.OVERTIME_RATE_MULTIPLIER;

    // Calculate base salary earned (proportional to days worked)
    const daysWorked = presentDays;
    const baseSalaryEarned = dailyRate * daysWorked;

    // Calculate overtime earnings
    const overtimeEarnings = overtimeHours * overtimeRate;

    // Calculate absence deductions (excluding holidays and approved leaves)
    // Absences on holidays or approved leave days should not be deducted
    const deductibleAbsences = this.calculateDeductibleAbsences(
      absentDays,
      holidays,
      attendanceRecords.data.filter((a) => a.status === 'Absent'),
    );
    const absenceDeductions = deductibleAbsences * dailyRate;

    // Calculate total salary
    const totalSalary = baseSalaryEarned + overtimeEarnings - absenceDeductions;

    // Create salary calculation record
    const salaryCalculation = {
      employee_id,
      period_start: startDate,
      period_end: endDate,
      base_salary: employee.base_salary,
      working_days_in_period: workingDaysInPeriod,
      days_worked: daysWorked,
      absent_days: absentDays,
      holiday_days: holidayDays,
      approved_leave_days: approvedLeaveDays,
      overtime_hours: overtimeHours,
      daily_rate: dailyRate,
      hourly_rate: hourlyRate,
      overtime_rate: overtimeRate,
      base_salary_earned: Math.round(baseSalaryEarned * 100) / 100,
      overtime_earnings: Math.round(overtimeEarnings * 100) / 100,
      absence_deductions: Math.round(absenceDeductions * 100) / 100,
      total_salary: Math.round(totalSalary * 100) / 100,
      notes,
    };

    // Check if calculation already exists for this period
    const existing = await this.salaryCalculationModel
      .findOne({
        employee_id,
        period_start: startDate,
        period_end: endDate,
      })
      .exec();

    if (existing) {
      // Update existing calculation
      return this.salaryCalculationModel
        .findOneAndUpdate(
          {
            employee_id,
            period_start: startDate,
            period_end: endDate,
          },
          salaryCalculation,
          { new: true },
        )
        .exec() as Promise<SalaryCalculation>;
    }

    // Create new calculation
    const created = new this.salaryCalculationModel(salaryCalculation);
    return created.save();
  }

  /**
   * Calculate the number of working days between two dates (excluding weekends)
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Get holidays in a date range
   */
  private async getHolidaysInPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<Holiday[]> {
    return this.holidayModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        is_paid: true,
      })
      .exec();
  }

  /**
   * Calculate deductible absences (excluding holidays)
   */
  private calculateDeductibleAbsences(
    totalAbsences: number,
    holidays: Holiday[],

    absentRecords: any[],
  ): number {
    if (totalAbsences === 0) return 0;

    // Get holiday dates for quick lookup
    const holidayDates = new Set(
      holidays.map((h) => new Date(h.date).toISOString().split('T')[0]),
    );

    // Count absences that don't fall on holidays
    const deductibleAbsences = absentRecords.filter((record) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return !holidayDates.has(recordDate);
    }).length;

    return deductibleAbsences;
  }

  /**
   * Calculate daily rate from monthly salary
   */
  private calculateDailyRate(monthlySalary: number): number {
    return (
      Math.round((monthlySalary / this.WORKING_DAYS_PER_MONTH) * 100) / 100
    );
  }

  /**
   * Calculate hourly rate from monthly salary
   */
  private calculateHourlyRate(monthlySalary: number): number {
    const dailyRate = this.calculateDailyRate(monthlySalary);
    return Math.round((dailyRate / this.STANDARD_HOURS_PER_DAY) * 100) / 100;
  }

  /**
   * Get salary calculations with pagination and filtering
   */
  async findAll(query: QuerySalaryDto) {
    const { employee_id, start_date, end_date, page = 1, limit = 10 } = query;

    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (start_date || end_date) {
      filter.period_start = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.period_start.$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.period_start.$lte = new Date(end_date);
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.salaryCalculationModel
        .find(filter)
        .sort({ period_start: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.salaryCalculationModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get salary calculation by employee and period
   */
  async findByEmployeeAndPeriod(
    employee_id: string,
    period_start: string,
    period_end: string,
  ): Promise<SalaryCalculation | null> {
    return this.salaryCalculationModel
      .findOne({
        employee_id,
        period_start: new Date(period_start),
        period_end: new Date(period_end),
      })
      .exec();
  }

  /**
   * Create or update a holiday
   */
  async createHoliday(
    date: string,
    name: string,
    description?: string,
  ): Promise<Holiday> {
    const holidayDate = new Date(date);

    // Check if holiday already exists
    const existing = await this.holidayModel
      .findOne({ date: holidayDate })
      .exec();

    if (existing) {
      // Update existing holiday
      existing.name = name;
      if (description) {
        existing.description = description;
      }
      return existing.save();
    }

    // Create new holiday
    const holiday = new this.holidayModel({
      date: holidayDate,
      name,
      description,
      is_paid: true,
    });

    return holiday.save();
  }

  /**
   * Get all holidays
   */
  async getAllHolidays(): Promise<Holiday[]> {
    return this.holidayModel.find().sort({ date: 1 }).exec();
  }

  /**
   * Delete a holiday
   */
  async deleteHoliday(date: string): Promise<void> {
    await this.holidayModel.deleteOne({ date: new Date(date) }).exec();
  }
}
