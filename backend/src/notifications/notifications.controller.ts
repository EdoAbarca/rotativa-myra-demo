import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AbsenceDetectionService } from './absence-detection.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { UpdateAbsenceAlertDto } from './dto/update-absence-alert.dto';
import { QueryAbsenceAlertsDto } from './dto/query-absence-alerts.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly absenceDetectionService: AbsenceDetectionService,
  ) {}

  @Get('preferences/:user_id')
  async getPreferences(@Param('user_id') user_id: string) {
    return this.notificationService.getOrCreatePreferences(user_id);
  }

  @Put('preferences/:user_id')
  async updatePreferences(
    @Param('user_id') user_id: string,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationService.updatePreferences(user_id, updateDto);
  }

  @Post('detect-absences')
  @HttpCode(HttpStatus.OK)
  async detectAbsences(@Query('date') date?: string) {
    const alerts = await this.absenceDetectionService.detectAbsences(date);
    return {
      success: true,
      message: `Detected ${alerts.length} new absence alerts`,
      alerts,
    };
  }

  @Get('absence-alerts')
  async getAbsenceAlerts(@Query() query: QueryAbsenceAlertsDto) {
    return this.absenceDetectionService.findAll(query);
  }

  @Get('absence-alerts/statistics')
  async getAbsenceStatistics(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.absenceDetectionService.getStatistics(start_date, end_date);
  }

  @Get('absence-alerts/:id')
  async getAbsenceAlert(@Param('id') id: string) {
    const alert = await this.absenceDetectionService.findById(id);
    if (!alert) {
      throw new NotFoundException(`Absence alert with ID ${id} not found`);
    }
    return alert;
  }

  @Put('absence-alerts/:id')
  async updateAbsenceAlert(
    @Param('id') id: string,
    @Body() updateDto: UpdateAbsenceAlertDto,
  ) {
    const alert = await this.absenceDetectionService.updateAlert(id, updateDto);
    if (!alert) {
      throw new NotFoundException(`Absence alert with ID ${id} not found`);
    }
    return alert;
  }
}
