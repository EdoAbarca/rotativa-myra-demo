import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AbsenceAlert,
  AbsenceAlertDocument,
} from './schemas/absence-alert.schema';
import { UpdateAbsenceAlertDto } from './dto/update-absence-alert.dto';
import { QueryAbsenceAlertsDto } from './dto/query-absence-alerts.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';
import { NotificationService } from './notification.service';

@Injectable()
export class AbsenceDetectionService {
  private readonly logger = new Logger(AbsenceDetectionService.name);

  constructor(
    @InjectModel(AbsenceAlert.name)
    private absenceAlertModel: Model<AbsenceAlertDocument>,
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
    private notificationService: NotificationService,
  ) {}

  async detectAbsences(date?: string): Promise<AbsenceAlert[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Detecting absences for date: ${targetDate}`);

    // Get all attendance records for the date
    const attendanceRecords = await this.attendanceService.findAllPaginated({
      start_date: targetDate,
      end_date: targetDate,
      limit: 1000,
    });

    const absences = attendanceRecords.data.filter(
      (record) => record.status === 'Absent',
    );

    this.logger.log(`Found ${absences.length} absences on ${targetDate}`);

    const alerts: AbsenceAlert[] = [];

    for (const absence of absences) {
      // Check if alert already exists
      const existingAlert = await this.absenceAlertModel
        .findOne({
          employee_id: absence.employee_id,
          absence_date: new Date(absence.date),
        })
        .exec();

      if (!existingAlert) {
        // Create new alert
        const alert = await this.absenceAlertModel.create({
          employee_id: absence.employee_id,
          absence_date: new Date(absence.date),
          status: 'unexcused',
          notification_sent: false,
          notification_channels: [],
        });

        // Get employee details for notification
        const employee = await this.employeesService.findByEmployeeId(
          absence.employee_id,
        );

        if (employee) {
          const employeeName = `${employee.first_name} ${employee.last_name}`;

          // Send notification
          await this.notificationService.notifyAbsence(
            absence.employee_id,
            employeeName,
            targetDate,
            'Absent',
          );

          // Mark notification as sent
          alert.notification_sent = true;
          alert.notification_channels = ['email', 'in_app'];
          await alert.save();
        }

        alerts.push(alert);
      } else if (
        existingAlert.status === 'unexcused' &&
        !existingAlert.notification_sent
      ) {
        // Resend notification for existing unexcused absences
        const employee = await this.employeesService.findByEmployeeId(
          absence.employee_id,
        );

        if (employee) {
          const employeeName = `${employee.first_name} ${employee.last_name}`;
          await this.notificationService.notifyAbsence(
            absence.employee_id,
            employeeName,
            targetDate,
            'Absent',
          );

          existingAlert.notification_sent = true;
          existingAlert.notification_channels = ['email', 'in_app'];
          await existingAlert.save();
        }

        alerts.push(existingAlert);
      }
    }

    return alerts;
  }

  async findAll(query: QueryAbsenceAlertsDto): Promise<AbsenceAlert[]> {
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.employee_id) {
      filter.employee_id = query.employee_id;
    }

    if (query.start_date || query.end_date) {
      filter.absence_date = {};
      if (query.start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.absence_date as any).$gte = new Date(query.start_date);
      }
      if (query.end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.absence_date as any).$lte = new Date(query.end_date);
      }
    }

    return this.absenceAlertModel
      .find(filter)
      .sort({ absence_date: -1 })
      .exec();
  }

  async findById(id: string): Promise<AbsenceAlert | null> {
    return this.absenceAlertModel.findById(id).exec();
  }

  async updateAlert(
    id: string,
    updateDto: UpdateAbsenceAlertDto,
  ): Promise<AbsenceAlert | null> {
    const alert = await this.absenceAlertModel.findById(id).exec();

    if (!alert) {
      return null;
    }

    Object.assign(alert, updateDto);

    // If reviewed_by is set and reviewed_at is not provided, set it to now
    if (updateDto.reviewed_by && !updateDto.reviewed_at) {
      alert.reviewed_at = new Date();
    }

    return alert.save();
  }

  async getStatistics(start_date?: string, end_date?: string) {
    const filter: Record<string, unknown> = {};

    if (start_date || end_date) {
      filter.absence_date = {};
      if (start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.absence_date as any).$gte = new Date(start_date);
      }
      if (end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.absence_date as any).$lte = new Date(end_date);
      }
    }

    const alerts = await this.absenceAlertModel.find(filter).exec();

    const total = alerts.length;
    const unexcused = alerts.filter((a) => a.status === 'unexcused').length;
    const excused = alerts.filter((a) => a.status === 'excused').length;
    const pending_review = alerts.filter(
      (a) => a.status === 'pending_review',
    ).length;

    return {
      total,
      unexcused,
      excused,
      pending_review,
      notification_sent_count: alerts.filter((a) => a.notification_sent).length,
    };
  }
}
