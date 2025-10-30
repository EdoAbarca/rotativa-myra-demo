import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadResultDto } from './dto/upload-result.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('employee_id') employee_id?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    // If any search parameters are provided, use search instead of findAll
    if (name || employee_id || department || status) {
      return this.employeesService.search({
        name,
        employee_id,
        department,
        status,
      });
    }
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findByEmployeeId(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateById(id, updateEmployeeDto);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateById(id, updateEmployeeDto);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.employeesService.deactivate(id, 'hr-employee', body.reason);
  }

  @Get(':id/audit-logs')
  async getAuditLogs(@Param('id') id: string) {
    return this.employeesService.getAuditLogs(id);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(
            new BadRequestException(
              'Only Excel files (.xlsx, .xls) are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.employeesService.processExcelUpload(file.buffer);
  }
}
