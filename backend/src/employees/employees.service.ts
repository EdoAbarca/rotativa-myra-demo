import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UploadResultDto } from './dto/upload-result.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';

interface RowData {
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  position?: string;
  base_salary?: number | string;
  hire_date?: string;
  status?: string;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const createdEmployee = new this.employeeModel(createEmployeeDto);
    return createdEmployee.save();
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async findByEmployeeId(employee_id: string): Promise<Employee | null> {
    return this.employeeModel.findOne({ employee_id }).exec();
  }

  async update(
    employee_id: string,
    updateData: Partial<CreateEmployeeDto>,
  ): Promise<Employee | null> {
    return this.employeeModel
      .findOneAndUpdate({ employee_id }, updateData, { new: true })
      .exec();
  }

  private async processRow(
    row: ExcelJS.Row,
    rowNumber: number,
    headers: string[],
    result: UploadResultDto,
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

      // Convert base_salary to number
      if (rowData.base_salary) {
        const salaryStr = String(rowData.base_salary).replace(/,/g, '');
        rowData.base_salary = parseFloat(salaryStr);
      }

      // Create DTO instance for validation
      const dto = plainToInstance(CreateEmployeeDto, rowData);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });

        result.errors.push({
          row: rowNumber,
          employee_id: rowData.employee_id,
          errors: errorMessages,
        });
        result.errorCount++;
        return;
      }

      // Check if employee exists
      const existingEmployee = await this.findByEmployeeId(dto.employee_id);

      if (existingEmployee) {
        // Update existing employee
        await this.update(dto.employee_id, dto);
        result.updated++;
      } else {
        // Create new employee
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
        errors: [errorMessage],
      });
      result.errorCount++;
    }
  }

  async processExcelUpload(buffer: Buffer): Promise<UploadResultDto> {
    const result: UploadResultDto = {
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
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'base_salary',
        'hire_date',
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

      // Process each row with concurrency control
      const rowsToProcess: { row: ExcelJS.Row; rowNumber: number }[] = [];

      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
        if (rowNumber === 1) return;
        rowsToProcess.push({ row, rowNumber });
      });

      // Process rows in batches to avoid overwhelming the database
      const BATCH_SIZE = 10; // Process 10 rows at a time
      for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
        const batch = rowsToProcess.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(({ row, rowNumber }) =>
          this.processRow(row, rowNumber, headers, result),
        );
        await Promise.all(batchPromises);
      }

      result.success = result.errorCount === 0;
      result.message = result.success
        ? `Successfully processed ${result.successCount} employees (${result.created} created, ${result.updated} updated)`
        : `Processed with errors: ${result.successCount} successful, ${result.errorCount} failed`;

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
}
