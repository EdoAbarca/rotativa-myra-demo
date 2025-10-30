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
  ValidationPipe,
  Sse,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AbsenceDetectionService } from './absence-detection.service';
import { LateArrivalDetectionService } from './late-arrival-detection.service';
import { RealtimeNotificationService } from './realtime-notification.service';
import { EmailService } from './email.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { UpdateAbsenceAlertDto } from './dto/update-absence-alert.dto';
import { QueryAbsenceAlertsDto } from './dto/query-absence-alerts.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly absenceDetectionService: AbsenceDetectionService,
    private readonly lateArrivalDetectionService: LateArrivalDetectionService,
    private readonly realtimeNotificationService: RealtimeNotificationService,
    private readonly emailService: EmailService,
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
  async getAbsenceAlerts(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryAbsenceAlertsDto,
  ) {
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

  // Real-time notification endpoints

  @Sse('stream/:user_id')
  streamNotifications(
    @Param('user_id') userId: string,
    @Res() response: Response,
  ): Observable<MessageEvent> {
    response.on('close', () => {
      this.realtimeNotificationService.unsubscribe(userId);
    });

    return this.realtimeNotificationService.subscribe(userId);
  }

  // Notification history endpoints

  @Get('history/:user_id')
  async getNotificationHistory(
    @Param('user_id') userId: string,
    @Query(new ValidationPipe({ transform: true }))
    query: QueryNotificationsDto,
  ) {
    return this.realtimeNotificationService.getNotifications(userId, query);
  }

  @Get('history/:user_id/statistics')
  async getNotificationStatistics(@Param('user_id') userId: string) {
    return this.realtimeNotificationService.getStatistics(userId);
  }

  @Put('history/:user_id/:notification_id')
  async updateNotification(
    @Param('user_id') userId: string,
    @Param('notification_id') notificationId: string,
    @Body() updateDto: UpdateNotificationDto,
  ) {
    const notification =
      await this.realtimeNotificationService.updateNotification(
        notificationId,
        userId,
        updateDto,
      );

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    return notification;
  }

  @Put('history/:user_id/mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param('user_id') userId: string) {
    const count = await this.realtimeNotificationService.markAllAsRead(userId);
    return {
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    };
  }

  @Put('history/:user_id/:notification_id/mark-read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('user_id') userId: string,
    @Param('notification_id') notificationId: string,
  ) {
    const notification = await this.realtimeNotificationService.markAsRead(
      notificationId,
      userId,
    );

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    return {
      success: true,
      message: 'Notification marked as read',
      notification,
    };
  }

  // Late arrival detection

  @Post('detect-late-arrivals')
  @HttpCode(HttpStatus.OK)
  async detectLateArrivals(@Query('date') date?: string) {
    const lateArrivals =
      await this.lateArrivalDetectionService.detectLateArrivals(date);

    // Send notifications for late arrivals
    for (const arrival of lateArrivals) {
      await this.notificationService.notifyLateArrival(
        arrival.employee_id,
        arrival.employee_name,
        arrival.date,
        arrival.expected_time,
        arrival.actual_time,
        arrival.minutes_late,
      );
    }

    return {
      success: true,
      message: `Detected ${lateArrivals.length} late arrivals`,
      late_arrivals: lateArrivals,
    };
  }

  // Email delivery tracking endpoints

  @Get('email-logs')
  async getEmailLogs(
    @Query('user_id') userId?: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.emailService.getEmailLogs(userId, limit);
    return {
      success: true,
      count: logs.length,
      logs,
    };
  }

  @Get('email-stats')
  async getEmailStats() {
    const stats = await this.emailService.getEmailStats();
    return {
      success: true,
      stats,
    };
  }

  @Get('email-connection')
  async verifyEmailConnection() {
    const isConnected = await this.emailService.verifyConnection();
    return {
      success: true,
      connected: isConnected,
      message: isConnected
        ? 'Email service is connected and ready'
        : 'Email service is not connected. Check configuration.',
    };
  }
}
