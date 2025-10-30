import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave, LeaveDocument } from './schemas/leave.schema';
import {
  LeaveBalance,
  LeaveBalanceDocument,
} from './schemas/leave-balance.schema';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UploadLeaveResultDto } from './dto/upload-leave-result.dto';
import { QueryLeavesDto } from './dto/query-leaves.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { EmployeesService } from '../employees/employees.service';

interface RowData {
  employee_id?: string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  reason?: string;
}

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(Leave.name)
    private leaveModel: Model<LeaveDocument>,
    @InjectModel(LeaveBalance.name)
    private leaveBalanceModel: Model<LeaveBalanceDocument>,
    private employeesService: EmployeesService,
  ) {}

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    // Validate dates
    const startDate = new Date(createLeaveDto.start_date);
    const endDate = new Date(createLeaveDto.end_date);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping leaves
    const hasOverlap = await this.checkOverlap(
      createLeaveDto.employee_id,
      createLeaveDto.start_date,
      createLeaveDto.end_date,
    );

    if (hasOverlap) {
      throw new BadRequestException(
        'Leave request overlaps with existing leave',
      );
    }

    const createdLeave = new this.leaveModel(createLeaveDto);
    const savedLeave = await createdLeave.save();

    // Update leave balance if status is Approved
    if (createLeaveDto.status === 'Approved') {
      await this.updateLeaveBalance(
        createLeaveDto.employee_id,
        createLeaveDto.leave_type,
        startDate,
        endDate,
      );
    }

    return savedLeave;
  }

  async findAll(): Promise<Leave[]> {
    return this.leaveModel.find().exec();
  }

  async findAllPaginated(query: QueryLeavesDto) {
    const {
      employee_id,
      start_date,
      end_date,
      leave_type,
      status,
      page = 1,
      limit = 10,
      sortBy = 'start_date',
      sortOrder = 'desc',
    } = query;

    // Build filter query
    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (leave_type) {
      filter.leave_type = leave_type;
    }

    if (status) {
      filter.status = status;
    }

    if (start_date || end_date) {
      filter.start_date = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.start_date.$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.start_date.$lte = new Date(end_date);
      }
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.leaveModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.leaveModel.countDocuments(filter).exec(),
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

  async checkOverlap(
    employee_id: string,
    start_date: string,
    end_date: string,
    excludeId?: string,
  ): Promise<boolean> {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const filter: Record<string, any> = {
      employee_id,
      status: { $ne: 'Rejected' }, // Only check non-rejected leaves
      $or: [
        // New leave starts during existing leave
        {
          start_date: { $lte: startDate },
          end_date: { $gte: startDate },
        },
        // New leave ends during existing leave
        {
          start_date: { $lte: endDate },
          end_date: { $gte: endDate },
        },
        // New leave completely contains existing leave
        {
          start_date: { $gte: startDate },
          end_date: { $lte: endDate },
        },
      ],
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const overlappingLeaves = await this.leaveModel.findOne(filter).exec();
    return !!overlappingLeaves;
  }

  private calculateLeaveDays(start_date: Date, end_date: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffTime = end_date.getTime() - start_date.getTime();
    const diffDays = Math.ceil(diffTime / msPerDay) + 1; // +1 to include both start and end dates
    return diffDays;
  }

  async getOrCreateLeaveBalance(
    employee_id: string,
  ): Promise<LeaveBalanceDocument> {
    let balance = await this.leaveBalanceModel.findOne({ employee_id }).exec();

    if (!balance) {
      // Create new balance with default values
      balance = new this.leaveBalanceModel({
        employee_id,
        vacation_balance: 20,
        sick_balance: 10,
        personal_balance: 5,
        vacation_used: 0,
        sick_used: 0,
        personal_used: 0,
      });
      await balance.save();
    }

    return balance;
  }

  async updateLeaveBalance(
    employee_id: string,
    leave_type: string,
    start_date: Date,
    end_date: Date,
  ): Promise<void> {
    const days = this.calculateLeaveDays(start_date, end_date);
    const balance = await this.getOrCreateLeaveBalance(employee_id);

    const balanceField = `${leave_type.toLowerCase()}_balance`;
    const usedField = `${leave_type.toLowerCase()}_used`;

    const currentBalance = balance[
      balanceField as keyof LeaveBalanceDocument
    ] as number;
    const currentUsed = balance[
      usedField as keyof LeaveBalanceDocument
    ] as number;

    if (currentBalance - currentUsed < days) {
      throw new BadRequestException(
        `Insufficient ${leave_type.toLowerCase()} leave balance`,
      );
    }

    // Update used days
    await this.leaveBalanceModel
      .findOneAndUpdate(
        { employee_id },
        { $inc: { [usedField]: days } },
        { new: true },
      )
      .exec();
  }

  async getLeaveBalance(employee_id: string): Promise<LeaveBalanceDocument> {
    return this.getOrCreateLeaveBalance(employee_id);
  }

  private async processRow(
    row: ExcelJS.Row,
    rowNumber: number,
    headers: string[],
    result: UploadLeaveResultDto,
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

      // Create DTO instance for validation
      const dto = plainToInstance(CreateLeaveDto, rowData);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });

        result.errors.push({
          row: rowNumber,
          employee_id: rowData.employee_id,
          start_date: rowData.start_date,
          end_date: rowData.end_date,
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
          start_date: dto.start_date,
          end_date: dto.end_date,
          errors: [`Employee ID ${dto.employee_id} does not exist in system`],
        });
        result.errorCount++;
        return;
      }

      // Validate dates
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      if (endDate < startDate) {
        result.errors.push({
          row: rowNumber,
          employee_id: dto.employee_id,
          start_date: dto.start_date,
          end_date: dto.end_date,
          errors: ['End date must be after or equal to start date'],
        });
        result.errorCount++;
        return;
      }

      // Check for overlapping leaves
      const hasOverlap = await this.checkOverlap(
        dto.employee_id,
        dto.start_date,
        dto.end_date,
      );

      if (hasOverlap) {
        result.errors.push({
          row: rowNumber,
          employee_id: dto.employee_id,
          start_date: dto.start_date,
          end_date: dto.end_date,
          errors: ['Leave request overlaps with existing leave'],
        });
        result.errorCount++;
        return;
      }

      // Calculate days
      const days = this.calculateLeaveDays(startDate, endDate);

      // If preview mode, just add to preview array
      if (preview) {
        if (!result.preview) {
          result.preview = [];
        }
        result.preview.push({
          employee_id: dto.employee_id,
          leave_type: dto.leave_type,
          start_date: dto.start_date,
          end_date: dto.end_date,
          status: dto.status,
          reason: dto.reason,
          days,
        });
        result.successCount++;
        return;
      }

      // Create new leave
      const createdLeave = new this.leaveModel(dto);
      await createdLeave.save();
      result.created++;

      // Update leave balance if status is Approved
      if (dto.status === 'Approved') {
        try {
          await this.updateLeaveBalance(
            dto.employee_id,
            dto.leave_type,
            startDate,
            endDate,
          );

          const balance = await this.getLeaveBalance(dto.employee_id);
          const balanceField = `${dto.leave_type.toLowerCase()}_balance`;
          const usedField = `${dto.leave_type.toLowerCase()}_used`;
          const totalBalance = balance[
            balanceField as keyof LeaveBalanceDocument
          ] as number;
          const usedBalance = balance[
            usedField as keyof LeaveBalanceDocument
          ] as number;
          const remaining = totalBalance - usedBalance;

          if (!result.balanceUpdates) {
            result.balanceUpdates = [];
          }
          result.balanceUpdates.push({
            employee_id: dto.employee_id,
            leave_type: dto.leave_type,
            days_deducted: days,
            remaining_balance: remaining,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Balance update failed';
          result.errors.push({
            row: rowNumber,
            employee_id: dto.employee_id,
            start_date: dto.start_date,
            end_date: dto.end_date,
            errors: [errorMessage],
          });
          result.errorCount++;
          return;
        }
      }

      result.successCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      result.errors.push({
        row: rowNumber,
        employee_id: rowData.employee_id || 'unknown',
        start_date: rowData.start_date || 'unknown',
        end_date: rowData.end_date || 'unknown',
        errors: [errorMessage],
      });
      result.errorCount++;
    }
  }

  async processExcelUpload(
    buffer: Buffer,
    preview: boolean = false,
  ): Promise<UploadLeaveResultDto> {
    const result: UploadLeaveResultDto = {
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
      const requiredHeaders = [
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'status',
      ];

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

      // Process rows sequentially to avoid race conditions with overlap detection
      for (const { row, rowNumber } of rowsToProcess) {
        await this.processRow(row, rowNumber, headers, result, preview);
      }

      result.success = result.errorCount === 0;
      if (preview) {
        result.message = result.success
          ? `Preview: ${result.successCount} leave records ready to import`
          : `Preview: ${result.successCount} valid records, ${result.errorCount} records with errors`;
      } else {
        result.message = result.success
          ? `Successfully processed ${result.successCount} leave records (${result.created} created, ${result.updated} updated)`
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

  async exportToExcel(query: QueryLeavesDto): Promise<Buffer> {
    const {
      employee_id,
      start_date,
      end_date,
      leave_type,
      status,
      sortBy = 'start_date',
      sortOrder = 'desc',
    } = query;

    // Build filter (same as findAllPaginated but without pagination)
    const filter: Record<string, any> = {};

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (leave_type) {
      filter.leave_type = leave_type;
    }

    if (status) {
      filter.status = status;
    }

    if (start_date || end_date) {
      filter.start_date = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.start_date.$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.start_date.$lte = new Date(end_date);
      }
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get all matching records
    const records = await this.leaveModel.find(filter).sort(sort).exec();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');

    // Add headers
    worksheet.columns = [
      { header: 'employee_id', key: 'employee_id', width: 15 },
      { header: 'leave_type', key: 'leave_type', width: 12 },
      { header: 'start_date', key: 'start_date', width: 12 },
      { header: 'end_date', key: 'end_date', width: 12 },
      { header: 'status', key: 'status', width: 12 },
      { header: 'reason', key: 'reason', width: 30 },
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
        leave_type: record.leave_type,
        start_date: new Date(record.start_date).toISOString().split('T')[0],
        end_date: new Date(record.end_date).toISOString().split('T')[0],
        status: record.status,
        reason: record.reason || '',
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
