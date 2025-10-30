import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payroll, PayrollDocument } from './schemas/payroll.schema';
import { SalaryService } from './salary.service';
import { EmployeesService } from '../employees/employees.service';
import { GeneratePayrollDto, QueryPayrollDto } from './dto/payroll.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(Payroll.name)
    private payrollModel: Model<PayrollDocument>,
    private salaryService: SalaryService,
    private employeesService: EmployeesService,
  ) {}

  /**
   * Generate monthly payroll for all employees
   */
  async generatePayroll(generateDto: GeneratePayrollDto): Promise<Payroll> {
    const { month, year, generated_by, notes, force_regenerate } = generateDto;

    // Check if payroll already exists
    const existingPayroll = await this.payrollModel.findOne({ month, year });
    if (existingPayroll && !force_regenerate) {
      throw new ConflictException(
        `Payroll for ${month}/${year} already exists. Use force_regenerate=true to regenerate.`,
      );
    }

    // Calculate period dates (first day to last day of month)
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0); // Last day of the month

    // Get all active employees
    const employeesResult = await this.employeesService.findAllPaginated({
      status: 'active',
      page: 1,
      limit: 10000, // Get all employees
    });

    const employees = employeesResult.data;

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found');
    }

    const employeeEntries = [];
    let totalEmployees = 0;
    let employeesWithIncompleteData = 0;
    let totalBaseSalary = 0;
    let totalOvertime = 0;
    let totalDeductions = 0;
    let totalPayroll = 0;

    // Calculate salary for each employee
    for (const employee of employees) {
      try {
        const warnings: string[] = [];
        let hasIncompleteData = false;

        // Check for incomplete data
        if (!employee.base_salary || employee.base_salary <= 0) {
          warnings.push('Missing or invalid base salary');
          hasIncompleteData = true;
        }

        // Calculate salary for the employee
        const salaryCalculation = await this.salaryService.calculateSalary({
          employee_id: employee.employee_id,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          notes: `Payroll ${month}/${year}`,
        });

        // Check for attendance data warnings
        if (salaryCalculation.days_worked === 0) {
          warnings.push('No attendance records found for this period');
          hasIncompleteData = true;
        }

        if (
          salaryCalculation.absent_days >
          salaryCalculation.working_days_in_period / 2
        ) {
          warnings.push('High absence rate detected');
        }

        if (hasIncompleteData) {
          employeesWithIncompleteData++;
        }

        const entry = {
          employee_id: employee.employee_id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          base_salary: salaryCalculation.base_salary,
          days_worked: salaryCalculation.days_worked,
          working_days_in_period: salaryCalculation.working_days_in_period,
          absent_days: salaryCalculation.absent_days,
          overtime_hours: salaryCalculation.overtime_hours,
          holiday_days: salaryCalculation.holiday_days,
          daily_rate: salaryCalculation.daily_rate,
          hourly_rate: salaryCalculation.hourly_rate,
          overtime_rate: salaryCalculation.overtime_rate,
          base_salary_earned: salaryCalculation.base_salary_earned,
          overtime_earnings: salaryCalculation.overtime_earnings,
          absence_deductions: salaryCalculation.absence_deductions,
          total_salary: salaryCalculation.total_salary,
          warnings,
          has_incomplete_data: hasIncompleteData,
        };

        employeeEntries.push(entry);
        totalEmployees++;
        totalBaseSalary += salaryCalculation.base_salary_earned;
        totalOvertime += salaryCalculation.overtime_earnings;
        totalDeductions += salaryCalculation.absence_deductions;
        totalPayroll += salaryCalculation.total_salary;
      } catch (error) {
        // If calculation fails for an employee, add with error warning
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const warnings = [`Failed to calculate salary: ${errorMessage}`];
        employeeEntries.push({
          employee_id: employee.employee_id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          base_salary: employee.base_salary || 0,
          days_worked: 0,
          working_days_in_period: 0,
          absent_days: 0,
          overtime_hours: 0,
          holiday_days: 0,
          daily_rate: 0,
          hourly_rate: 0,
          overtime_rate: 0,
          base_salary_earned: 0,
          overtime_earnings: 0,
          absence_deductions: 0,
          total_salary: 0,
          warnings,
          has_incomplete_data: true,
        });
        totalEmployees++;
        employeesWithIncompleteData++;
      }
    }

    const payrollData = {
      month,
      year,
      period_start: periodStart,
      period_end: periodEnd,
      total_employees: totalEmployees,
      employees_with_incomplete_data: employeesWithIncompleteData,
      total_base_salary: totalBaseSalary,
      total_overtime: totalOvertime,
      total_deductions: totalDeductions,
      total_payroll: totalPayroll,
      employee_entries: employeeEntries,
      generated_by,
      notes,
      status: 'finalized',
    };

    // Update or create payroll
    if (existingPayroll && force_regenerate) {
      const updated = await this.payrollModel.findOneAndUpdate(
        { month, year },
        payrollData,
        { new: true },
      );
      if (!updated) {
        throw new Error('Failed to update payroll');
      }
      return updated;
    } else {
      return this.payrollModel.create(payrollData);
    }
  }

  /**
   * Get all payrolls with pagination
   */
  async findAll(query: QueryPayrollDto): Promise<{
    data: Payroll[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { month, year, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    const [data, total] = await Promise.all([
      this.payrollModel
        .find(filter)
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.payrollModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get a specific payroll by month and year
   */
  async findByMonthYear(month: number, year: number): Promise<Payroll> {
    const payroll = await this.payrollModel.findOne({ month, year });
    if (!payroll) {
      throw new NotFoundException(`Payroll for ${month}/${year} not found`);
    }
    return payroll;
  }

  /**
   * Export payroll to Excel
   */
  async exportToExcel(month: number, year: number): Promise<Buffer> {
    const payroll = await this.findByMonthYear(month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Payroll ${month}-${year}`);

    // Set column widths
    worksheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Employee Name', key: 'employee_name', width: 25 },
      { header: 'Base Salary', key: 'base_salary', width: 15 },
      { header: 'Days Worked', key: 'days_worked', width: 12 },
      { header: 'Working Days', key: 'working_days', width: 12 },
      { header: 'Absent Days', key: 'absent_days', width: 12 },
      { header: 'Overtime Hours', key: 'overtime_hours', width: 15 },
      { header: 'Daily Rate', key: 'daily_rate', width: 12 },
      { header: 'Hourly Rate', key: 'hourly_rate', width: 12 },
      { header: 'Base Earned', key: 'base_earned', width: 15 },
      { header: 'Overtime Earned', key: 'overtime_earned', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 15 },
      { header: 'Total Salary', key: 'total_salary', width: 15 },
      { header: 'Warnings', key: 'warnings', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows
    payroll.employee_entries.forEach((entry) => {
      const row = worksheet.addRow({
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        base_salary: entry.base_salary,
        days_worked: entry.days_worked,
        working_days: entry.working_days_in_period,
        absent_days: entry.absent_days,
        overtime_hours: entry.overtime_hours,
        daily_rate: entry.daily_rate,
        hourly_rate: entry.hourly_rate,
        base_earned: entry.base_salary_earned,
        overtime_earned: entry.overtime_earnings,
        deductions: entry.absence_deductions,
        total_salary: entry.total_salary,
        warnings: entry.warnings.join('; '),
      });

      // Format currency cells
      [
        'base_salary',
        'daily_rate',
        'hourly_rate',
        'base_earned',
        'overtime_earned',
        'deductions',
        'total_salary',
      ].forEach((key) => {
        const cell = row.getCell(key);
        cell.numFmt = '$#,##0.00';
      });

      // Highlight rows with warnings
      if (entry.has_incomplete_data) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEBEE' },
          };
        });
      }
    });

    // Add summary section
    worksheet.addRow([]);
    const summaryStartRow = worksheet.lastRow?.number || 1;
    const summaryRow = summaryStartRow + 1;

    worksheet.addRow(['Summary']);
    worksheet.getRow(summaryRow).font = { bold: true, size: 14 };

    worksheet.addRow(['Total Employees:', payroll.total_employees]);
    worksheet.addRow([
      'Employees with Incomplete Data:',
      payroll.employees_with_incomplete_data,
    ]);
    worksheet.addRow(['Total Base Salary:', payroll.total_base_salary]);
    worksheet.addRow(['Total Overtime:', payroll.total_overtime]);
    worksheet.addRow(['Total Deductions:', payroll.total_deductions]);
    worksheet.addRow(['Total Payroll:', payroll.total_payroll]);

    // Format summary values
    for (let i = summaryRow + 2; i <= summaryRow + 6; i++) {
      worksheet.getRow(i).getCell(2).numFmt = '$#,##0.00';
      worksheet.getRow(i).getCell(1).font = { bold: true };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Delete a payroll
   */
  async delete(month: number, year: number): Promise<void> {
    const result = await this.payrollModel.deleteOne({ month, year });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Payroll for ${month}/${year} not found`);
    }
  }
}
