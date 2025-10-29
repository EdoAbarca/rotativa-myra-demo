import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { UploadResultDto } from './dto/upload-result.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll() {
    return this.employeesService.findAll();
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
