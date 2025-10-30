import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UploadAttendanceResultDto } from './dto/upload-attendance-result.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  AttendanceSummaryDto,
  AttendanceStatisticsDto,
} from './dto/attendance-summary.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { EmployeesService } from '../employees/employees.service';

interface RowData {
  employee_id?: string;
  date?: string;
  status?: string;
  check_in_time?: string;
  check_out_time?: string;
  hours_worked?: number | string;
  overtime_hours?: number | string;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    private employeesService: EmployeesService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Calculate hours if not provided
    if (
      !createAttendanceDto.hours_worked &&
      createAttendanceDto.check_in_time &&
      createAttendanceDto.check_out_time
    ) {
      const calculated = this.calculateHours(
        createAttendanceDto.check_in_time,
        createAttendanceDto.check_out_time,
      );
      createAttendanceDto.hours_worked = calculated.hours_worked;
      createAttendanceDto.overtime_hours = calculated.overtime_hours;
    }

    const createdAttendance = new this.attendanceModel(createAttendanceDto);
    return createdAttendance.save();
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceModel.find().exec();
  }

  async findByEmployeeIdAndDate(
    employee_id: string,
    date: string,
  ): Promise<Attendance | null> {
    return this.attendanceModel
      .findOne({
        employee_id,
        date: new Date(date),
      })
      .exec();
  }

  async update(
    employee_id: string,
    date: string,
    updateData: Partial<CreateAttendanceDto>,
  ): Promise<Attendance | null> {
    // Recalculate hours if times are provided
    if (
      updateData.check_in_time &&
      updateData.check_out_time &&
      !updateData.hours_worked
    ) {
      const calculated = this.calculateHours(
        updateData.check_in_time,
        updateData.check_out_time,
      );
      updateData.hours_worked = calculated.hours_worked;
      updateData.overtime_hours = calculated.overtime_hours;
    }

    return this.attendanceModel
      .findOneAndUpdate({ employee_id, date: new Date(date) }, updateData, {
        new: true,
      })
      .exec();
  }

  private calculateHours(
    checkIn: string,
    checkOut: string,
  ): { hours_worked: number; overtime_hours: number } {
    try {
      // Parse time strings (format: HH:MM or HH:MM:SS)
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours + minutes / 60;
      };

      const checkInHours = parseTime(checkIn);
      const checkOutHours = parseTime(checkOut);

      let totalHours = checkOutHours - checkInHours;

      // Handle overnight shifts
      if (totalHours < 0) {
        totalHours += 24;
      }

      // Standard work day is 8 hours
      const standardHours = 8;
      const hours_worked = Math.min(totalHours, standardHours);
      const overtime_hours = Math.max(0, totalHours - standardHours);

      return {
        hours_worked: Math.round(hours_worked * 100) / 100,
        overtime_hours: Math.round(overtime_hours * 100) / 100,
      };
    } catch {
      return { hours_worked: 0, overtime_hours: 0 };
    }
  }

  private async processRow(
    row: ExcelJS.Row,
    rowNumber: number,
    headers: string[],
    result: UploadAttendanceResultDto,
    preview: boolean = false,
  ): Promise<void> {
    const rowData: RowData = {};
    try {
      headers.forEach((header, index) => {
        const cell = row.getCell(index + 1);
        const value = cell.value;

        // Handle date cells
        if (value instanceof Date) {
          rowData[header as keyof RowData] = value.toISOString().split('T')[0];
        } else if (
          typeof value === 'object' &&
          value !== null &&
          'result' in value
        ) {
          // Handle formula cells
          const formulaValue = (value as { result: unknown }).result;
          if (formulaValue !== null && formulaValue !== undefined) {
            if (typeof formulaValue === 'object' && 'text' in formulaValue) {
              rowData[header as keyof RowData] = String(
                (formulaValue as { text: unknown }).text,
              ).trim();
            } else if (
              typeof formulaValue === 'string' ||
              typeof formulaValue === 'number' ||
              typeof formulaValue === 'boolean'
            ) {
              rowData[header as keyof RowData] = String(formulaValue).trim();
            } else {
              rowData[header as keyof RowData] = '';
            }
          } else {
            rowData[header as keyof RowData] = '';
          }
        } else if (value !== null && value !== undefined) {
          if (typeof value === 'object' && 'text' in value) {
            rowData[header as keyof RowData] = String(
              (value as { text: unknown }).text,
            ).trim();
          } else if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
          ) {
            rowData[header as keyof RowData] = String(value).trim();
          } else {
            rowData[header as keyof RowData] = '';
          }
        } else {
          rowData[header as keyof RowData] = '';
        }
      });

      // Convert numeric fields
      if (rowData.hours_worked) {
        const hoursStr = String(rowData.hours_worked).replace(/,/g, '');
        rowData.hours_worked = parseFloat(hoursStr);
      }
      if (rowData.overtime_hours) {
        const overtimeStr = String(rowData.overtime_hours).replace(/,/g, '');
        rowData.overtime_hours = parseFloat(overtimeStr);
      }

      // Calculate hours if times provided but hours not
      if (
        rowData.check_in_time &&
        rowData.check_out_time &&
        !rowData.hours_worked
      ) {
        const calculated = this.calculateHours(
          rowData.check_in_time,
          rowData.check_out_time,
        );
        rowData.hours_worked = calculated.hours_worked;
        rowData.overtime_hours = calculated.overtime_hours;
      }

      // Handle Absent status - set times and hours to 0
      if (rowData.status === 'Absent') {
        rowData.check_in_time = undefined;
        rowData.check_out_time = undefined;
        rowData.hours_worked = 0;
        rowData.overtime_hours = 0;
      }

      // Create DTO instance for validation
      const dto = plainToInstance(CreateAttendanceDto, rowData);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });

        result.errors.push({
          row: rowNumber,
          employee_id: rowData.employee_id,
          date: rowData.date,
          errors: errorMessages,
        });
        result.errorCount++;
        return;
      }

      // Validate employee exists
      const employee = await this.employeesService.findByEmployeeId(
        dto.employee_id,
      );
      if (!employee) {
        result.errors.push({
          row: rowNumber,
          employee_id: dto.employee_id,
          date: dto.date,
          errors: [`Employee ID ${dto.employee_id} does not exist in system`],
        });
        result.errorCount++;
        return;
      }

      // If preview mode, just add to preview array
      if (preview) {
        if (!result.preview) {
          result.preview = [];
        }
        result.preview.push({
          employee_id: dto.employee_id,
          date: dto.date,
          status: dto.status,
          check_in_time: dto.check_in_time,
          check_out_time: dto.check_out_time,
          hours_worked: dto.hours_worked || 0,
          overtime_hours: dto.overtime_hours || 0,
        });
        result.successCount++;
        return;
      }

      // Check if attendance record exists
      const existingAttendance = await this.findByEmployeeIdAndDate(
        dto.employee_id,
        dto.date,
      );

      if (existingAttendance) {
        // Update existing attendance
        await this.update(dto.employee_id, dto.date, dto);
        result.updated++;
      } else {
        // Create new attendance
        await this.create(dto);
        result.created++;
      }

      result.successCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      result.errors.push({
        row: rowNumber,
        employee_id: rowData.employee_id || 'unknown',
        date: rowData.date || 'unknown',
        errors: [errorMessage],
      });
      result.errorCount++;
    }
  }

  async processExcelUpload(
    buffer: Buffer,
    preview: boolean = false,
  ): Promise<UploadAttendanceResultDto> {
    const result: UploadAttendanceResultDto = {
      success: false,
      message: '',
      successCount: 0,
      errorCount: 0,
      errors: [],
      created: 0,
      updated: 0,
    };

    try {
      const workbook = new ExcelJS.Workbook();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await workbook.xlsx.load(buffer as any);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new BadRequestException('Excel file is empty or invalid');
      }

      // Read header row
      const headerRow = worksheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell, colNumber) => {
        const cellValue = cell.value;
        if (cellValue !== null && cellValue !== undefined) {
          if (typeof cellValue === 'object' && 'text' in cellValue) {
            headers[colNumber - 1] = String(
              (cellValue as { text: unknown }).text,
            ).trim();
          } else if (
            typeof cellValue === 'string' ||
            typeof cellValue === 'number' ||
            typeof cellValue === 'boolean'
          ) {
            headers[colNumber - 1] = String(cellValue).trim();
          } else {
            headers[colNumber - 1] = '';
          }
        } else {
          headers[colNumber - 1] = '';
        }
      });

      // Validate required headers
      const requiredHeaders = ['employee_id', 'date', 'status'];

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required columns: ${missingHeaders.join(', ')}`,
        );
      }

      // Process each row
      const rowsToProcess: { row: ExcelJS.Row; rowNumber: number }[] = [];

      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
        if (rowNumber === 1) return;
        rowsToProcess.push({ row, rowNumber });
      });

      // Process rows in batches
      const BATCH_SIZE = 10;
      for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
        const batch = rowsToProcess.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(({ row, rowNumber }) =>
          this.processRow(row, rowNumber, headers, result, preview),
        );
        await Promise.all(batchPromises);
      }

      result.success = result.errorCount === 0;
      if (preview) {
        result.message = result.success
          ? `Preview: ${result.successCount} records ready to import`
          : `Preview: ${result.successCount} valid records, ${result.errorCount} records with errors`;
      } else {
        result.message = result.success
          ? `Successfully processed ${result.successCount} attendance records (${result.created} created, ${result.updated} updated)`
          : `Processed with errors: ${result.successCount} successful, ${result.errorCount} failed`;
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to process Excel file: ${errorMessage}`,
      );
    }
  }

  async findAllPaginated(query: QueryAttendanceDto) {
    const {
      employee_id,
      start_date,
      end_date,
      status,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    // Build filter query

    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (status) {
      filter.status = status;
    }

    if (start_date || end_date) {
      filter.date = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.date.$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.date.$lte = new Date(end_date);
      }
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),

      this.attendanceModel.countDocuments(filter).exec(),
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

  async getDailySummary(date: string): Promise<AttendanceSummaryDto> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const records = await this.attendanceModel
      .find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();

    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;

    return {
      date,
      total,
      present,
      absent,
      late,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
      latePercentage: total > 0 ? Math.round((late / total) * 100) : 0,
    };
  }

  async getStatistics(
    start_date?: string,
    end_date?: string,
    employee_id?: string,
  ): Promise<AttendanceStatisticsDto> {
    // Build filter

    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    // Default to last 30 days if no date range provided
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(now.getDate() - 30);

    const startDate = start_date ? new Date(start_date) : defaultStartDate;
    const endDate = end_date ? new Date(end_date) : now;

    filter.date = {
      $gte: startDate,
      $lte: endDate,
    };

    // Get all records in the range

    const records = await this.attendanceModel.find(filter).exec();

    // Calculate overall summary
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;

    const summary: AttendanceSummaryDto = {
      date: startDate.toISOString().split('T')[0],
      total,
      present,
      absent,
      late,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
      latePercentage: total > 0 ? Math.round((late / total) * 100) : 0,
    };

    // Daily breakdown
    const dailyMap = new Map<
      string,
      { present: number; absent: number; late: number }
    >();

    records.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { present: 0, absent: 0, late: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      if (record.status === 'Present') day.present++;
      else if (record.status === 'Absent') day.absent++;
      else if (record.status === 'Late') day.late++;
    });

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Employee breakdown (only if not filtering by employee)
    let employeeBreakdown: AttendanceStatisticsDto['employeeBreakdown'] = [];
    if (!employee_id) {
      const employeeMap = new Map<
        string,
        {
          total_days: number;
          present_days: number;
          absent_days: number;
          late_days: number;
          total_hours: number;
          overtime_hours: number;
        }
      >();

      records.forEach((record) => {
        if (!employeeMap.has(record.employee_id)) {
          employeeMap.set(record.employee_id, {
            total_days: 0,
            present_days: 0,
            absent_days: 0,
            late_days: 0,
            total_hours: 0,
            overtime_hours: 0,
          });
        }
        const emp = employeeMap.get(record.employee_id)!;
        emp.total_days++;
        if (record.status === 'Present') emp.present_days++;
        else if (record.status === 'Absent') emp.absent_days++;
        else if (record.status === 'Late') emp.late_days++;
        emp.total_hours += record.hours_worked || 0;
        emp.overtime_hours += record.overtime_hours || 0;
      });

      employeeBreakdown = Array.from(employeeMap.entries()).map(
        ([employee_id, stats]) => ({ employee_id, ...stats }),
      );
    }

    // Get unique employees count
    const uniqueEmployees = new Set(records.map((r) => r.employee_id));

    return {
      totalEmployees: uniqueEmployees.size,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      summary,
      dailyBreakdown,
      employeeBreakdown,
    };
  }

  async exportToExcel(query: QueryAttendanceDto): Promise<Buffer> {
    const {
      employee_id,
      start_date,
      end_date,
      status,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    // Build filter (same as findAllPaginated but without pagination)

    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (status) {
      filter.status = status;
    }

    if (start_date || end_date) {
      filter.date = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.date.$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.date.$lte = new Date(end_date);
      }
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get all matching records

    const records = await this.attendanceModel.find(filter).sort(sort).exec();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Check In', key: 'check_in_time', width: 12 },
      { header: 'Check Out', key: 'check_out_time', width: 12 },
      { header: 'Hours Worked', key: 'hours_worked', width: 15 },
      { header: 'Overtime Hours', key: 'overtime_hours', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Add data rows
    records.forEach((record) => {
      worksheet.addRow({
        employee_id: record.employee_id,
        date: new Date(record.date).toISOString().split('T')[0],
        status: record.status,
        check_in_time: record.check_in_time || '',
        check_out_time: record.check_out_time || '',
        hours_worked: record.hours_worked || 0,
        overtime_hours: record.overtime_hours || 0,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
