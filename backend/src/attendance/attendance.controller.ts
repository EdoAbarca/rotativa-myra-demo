import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { UploadAttendanceResultDto } from './dto/upload-attendance-result.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(@Query() query: QueryAttendanceDto) {
    if (Object.keys(query).length === 0) {
      return this.attendanceService.findAll();
    }
    return this.attendanceService.findAllPaginated(query);
  }

  @Get('dashboard/summary')
  async getDailySummary(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getDailySummary(targetDate);
  }

  @Get('dashboard/statistics')
  async getStatistics(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('employee_id') employee_id?: string,
  ) {
    return this.attendanceService.getStatistics(
      start_date,
      end_date,
      employee_id,
    );
  }

  @Get('export')
  async exportToExcel(
    @Query() query: QueryAttendanceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.attendanceService.exportToExcel(query);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `attendance_report_${timestamp}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
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
    @Query('preview') preview?: string,
  ): Promise<UploadAttendanceResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const isPreview = preview === 'true';
    return this.attendanceService.processExcelUpload(file.buffer, isPreview);
  }
}
