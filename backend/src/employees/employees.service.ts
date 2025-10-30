import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadResultDto } from './dto/upload-result.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { AuditService } from '../audit/audit.service';

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

export interface SearchEmployeesParams {
  name?: string;
  employee_id?: string;
  department?: string;
  status?: string;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    private auditService: AuditService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    performedBy = 'system',
  ): Promise<Employee> {
    const createdEmployee = new this.employeeModel(createEmployeeDto);
    const saved = await createdEmployee.save();

    // Log the creation
    await this.auditService.log({
      entity_type: 'Employee',
      entity_id: saved.employee_id,
      action: 'create',
      changes: createEmployeeDto,
      performed_by: performedBy,
    });

    return saved;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async findAllPaginated(query: QueryEmployeesDto) {
    const {
      page = 1,
      limit = 10,
      name,
      employee_id,
      department,
      position,
      status,
      sortBy = 'employee_id',
      sortOrder = 'asc',
    } = query;

    // Build filter query
    const filter: Record<string, unknown> = {};

    // Helper function to escape special regex characters
    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (employee_id) {
      filter.employee_id = {
        $regex: escapeRegex(employee_id),
        $options: 'i',
      };
    }

    if (name) {
      const escapedName = escapeRegex(name);
      filter.$or = [
        { first_name: { $regex: escapedName, $options: 'i' } },
        { last_name: { $regex: escapedName, $options: 'i' } },
      ];
    }

    if (department) {
      filter.department = {
        $regex: escapeRegex(department),
        $options: 'i',
      };
    }

    if (position) {
      filter.position = {
        $regex: escapeRegex(position),
        $options: 'i',
      };
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortBy === 'name') {
      sort.first_name = sortOrder === 'asc' ? 1 : -1;
      sort.last_name = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [employees, total] = await Promise.all([
      this.employeeModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.employeeModel.countDocuments(filter).exec(),
    ]);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportToExcel(query: QueryEmployeesDto): Promise<Buffer> {
    // Get all employees matching the filter (without pagination)
    const {
      name,
      employee_id,
      department,
      position,
      status,
      sortBy = 'employee_id',
      sortOrder = 'asc',
    } = query;

    const filter: Record<string, unknown> = {};

    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (employee_id) {
      filter.employee_id = {
        $regex: escapeRegex(employee_id),
        $options: 'i',
      };
    }

    if (name) {
      const escapedName = escapeRegex(name);
      filter.$or = [
        { first_name: { $regex: escapedName, $options: 'i' } },
        { last_name: { $regex: escapedName, $options: 'i' } },
      ];
    }

    if (department) {
      filter.department = {
        $regex: escapeRegex(department),
        $options: 'i',
      };
    }

    if (position) {
      filter.position = {
        $regex: escapeRegex(position),
        $options: 'i',
      };
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortBy === 'name') {
      sort.first_name = sortOrder === 'asc' ? 1 : -1;
      sort.last_name = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const employees = await this.employeeModel.find(filter).sort(sort).exec();

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Define columns
    worksheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Base Salary', key: 'base_salary', width: 15 },
      { header: 'Hire Date', key: 'hire_date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Add data rows
    employees.forEach((employee) => {
      worksheet.addRow({
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        base_salary: employee.base_salary,
        hire_date:
          employee.hire_date instanceof Date
            ? employee.hire_date.toISOString().split('T')[0]
            : employee.hire_date,
        status: employee.status,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async search(params: SearchEmployeesParams): Promise<Employee[]> {
    const query: Record<string, unknown> = {};

    // Helper function to escape special regex characters
    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (params.employee_id) {
      query.employee_id = {
        $regex: escapeRegex(params.employee_id),
        $options: 'i',
      };
    }

    if (params.name) {
      const escapedName = escapeRegex(params.name);
      query.$or = [
        { first_name: { $regex: escapedName, $options: 'i' } },
        { last_name: { $regex: escapedName, $options: 'i' } },
      ];
    }

    if (params.department) {
      query.department = {
        $regex: escapeRegex(params.department),
        $options: 'i',
      };
    }

    if (params.status) {
      query.status = params.status;
    }

    return this.employeeModel.find(query).exec();
  }

  async findByEmployeeId(employee_id: string): Promise<Employee | null> {
    return this.employeeModel.findOne({ employee_id }).exec();
  }

  async update(
    employee_id: string,
    updateData: Partial<CreateEmployeeDto>,
    performedBy = 'system',
  ): Promise<Employee | null> {
    // Get the previous values before update
    const previousEmployee = await this.findByEmployeeId(employee_id);

    const updated = await this.employeeModel
      .findOneAndUpdate({ employee_id }, updateData, { new: true })
      .exec();

    // Log the update if employee was found
    if (updated && previousEmployee) {
      const previousValues: Record<string, unknown> = {};
      const keys = Object.keys(updateData) as Array<keyof typeof updateData>;
      keys.forEach((key) => {
        if (key in previousEmployee) {
          previousValues[key] = previousEmployee[key as keyof Employee];
        }
      });

      await this.auditService.log({
        entity_type: 'Employee',
        entity_id: employee_id,
        action: 'update',
        changes: updateData,
        previous_values: previousValues,
        performed_by: performedBy,
      });
    }

    return updated;
  }

  async updateById(
    employee_id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    performedBy = 'hr-employee',
  ): Promise<Employee> {
    const employee = await this.findByEmployeeId(employee_id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    const updated = await this.update(
      employee_id,
      updateEmployeeDto,
      performedBy,
    );
    if (!updated) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    return updated;
  }

  async deactivate(
    employee_id: string,
    performedBy = 'hr-employee',
    reason?: string,
  ): Promise<Employee> {
    const employee = await this.findByEmployeeId(employee_id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    if (employee.status === 'inactive') {
      throw new BadRequestException('Employee is already inactive');
    }

    const updated = await this.employeeModel
      .findOneAndUpdate({ employee_id }, { status: 'inactive' }, { new: true })
      .exec();

    if (updated) {
      await this.auditService.log({
        entity_type: 'Employee',
        entity_id: employee_id,
        action: 'deactivate',
        changes: { status: 'inactive' },
        previous_values: { status: employee.status },
        performed_by: performedBy,
        reason,
      });
    }

    return updated!;
  }

  async getAuditLogs(employee_id: string) {
    const employee = await this.findByEmployeeId(employee_id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    return this.auditService.findByEntity('Employee', employee_id);
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
