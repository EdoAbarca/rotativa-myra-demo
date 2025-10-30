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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadResultDto } from './dto/upload-result.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryEmployeesDto,
  ) {
    return this.employeesService.findAllPaginated(query);
  }

  @Get('export')
  async exportToExcel(
    @Query(new ValidationPipe({ transform: true })) query: QueryEmployeesDto,
    @Res() res: Response,
  ) {
    const buffer = await this.employeesService.exportToExcel(query);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=employees-export-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
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
