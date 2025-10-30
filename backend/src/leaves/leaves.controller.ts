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
import type { Response } from 'express';
import { LeavesService } from './leaves.service';
import { UploadLeaveResultDto } from './dto/upload-leave-result.dto';
import { QueryLeavesDto } from './dto/query-leaves.dto';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  async findAll(@Query() query: QueryLeavesDto) {
    if (Object.keys(query).length === 0) {
      return this.leavesService.findAll();
    }
    return this.leavesService.findAllPaginated(query);
  }

  @Get('balance/:employee_id')
  async getBalance(@Query('employee_id') employee_id: string) {
    if (!employee_id) {
      throw new BadRequestException('Employee ID is required');
    }
    return this.leavesService.getLeaveBalance(employee_id);
  }

  @Get('export')
  async exportToExcel(
    @Query() query: QueryLeavesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.leavesService.exportToExcel(query);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leave_report_${timestamp}.xlsx`;

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
  ): Promise<UploadLeaveResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const isPreview = preview === 'true';
    return this.leavesService.processExcelUpload(file.buffer, isPreview);
  }
}
