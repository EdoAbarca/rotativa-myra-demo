import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationPreference,
  NotificationPreferenceDocument,
} from './schemas/notification-preference.schema';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { RealtimeNotificationService } from './realtime-notification.service';
import { EmailService } from './email.service';

export interface NotificationPayload {
  employee_id: string;
  employee_name?: string;
  absence_date: string;
  absence_type: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(NotificationPreference.name)
    private notificationPreferenceModel: Model<NotificationPreferenceDocument>,
    @Inject(forwardRef(() => RealtimeNotificationService))
    private realtimeNotificationService: RealtimeNotificationService,
    private emailService: EmailService,
  ) {}

  async getPreferences(
    user_id: string,
  ): Promise<NotificationPreferenceDocument | null> {
    return this.notificationPreferenceModel.findOne({ user_id }).exec();
  }

  async getOrCreatePreferences(
    user_id: string,
  ): Promise<NotificationPreferenceDocument> {
    let preferences = await this.getPreferences(user_id);

    if (!preferences) {
      // Create default preferences
      const created = await this.notificationPreferenceModel.create({
        user_id,
        email_enabled: true,
        in_app_enabled: true,
        notification_types: ['absence', 'late'],
      });
      preferences = created;
    }

    return preferences;
  }

  async updatePreferences(
    user_id: string,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceDocument> {
    const preferences = await this.getOrCreatePreferences(user_id);

    Object.assign(preferences, updateDto);
    return preferences.save();
  }

  async sendNotification(
    user_id: string,
    payload: NotificationPayload,
  ): Promise<{ email_sent: boolean; in_app_sent: boolean }> {
    const preferences = await this.getOrCreatePreferences(user_id);

    const result = {
      email_sent: false,
      in_app_sent: false,
    };

    // Check if notification type is enabled
    if (
      !preferences.notification_types.includes(payload.absence_type) &&
      !preferences.notification_types.includes('absence')
    ) {
      this.logger.log(
        `Notification type ${payload.absence_type} not enabled for user ${user_id}`,
      );
      return result;
    }

    // Send email notification
    if (preferences.email_enabled) {
      result.email_sent = await this.sendEmailNotification(
        preferences.email_address || `${user_id}@company.com`,
        payload,
        user_id,
      );
    }

    // Send in-app notification
    if (preferences.in_app_enabled) {
      result.in_app_sent = this.sendInAppNotification(user_id, payload);
    }

    return result;
  }

  private async sendEmailNotification(
    email: string,
    payload: NotificationPayload,
    user_id?: string,
  ): Promise<boolean> {
    try {
      // Use real email service
      await this.emailService.sendEmail({
        to: email,
        subject: `${payload.absence_type === 'late' ? 'Late Arrival' : 'Absence'} Alert - ${payload.employee_name}`,
        template:
          payload.absence_type === 'late'
            ? 'late-arrival-alert'
            : 'absence-alert',
        context: {
          employee_id: payload.employee_id,
          employee_name: payload.employee_name,
          absence_date: payload.absence_date,
          absence_type: payload.absence_type,
          date: payload.absence_date,
        },
        user_id,
      });

      this.logger.log(`Email queued for ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      return false;
    }
  }

  private sendInAppNotification(
    user_id: string,
    payload: NotificationPayload,
  ): boolean {
    try {
      // Send real-time notification
      this.logger.log(`Sending in-app notification to user ${user_id}`);
      this.logger.log(`Message: ${payload.message}`);
      this.logger.log(
        `Employee: ${payload.employee_name} (${payload.employee_id})`,
      );
      this.logger.log(`Date: ${payload.absence_date}`);

      // Send via real-time notification service
      this.realtimeNotificationService
        .sendRealTimeNotification(
          user_id,
          payload.absence_type,
          `Absence Alert - ${payload.employee_name}`,
          payload.message,
          {
            employee_id: payload.employee_id,
            employee_name: payload.employee_name,
            absence_date: payload.absence_date,
          },
          'warning',
        )
        .catch((error) => {
          this.logger.error(`Failed to send real-time notification: ${error}`);
        });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error}`);
      return false;
    }
  }

  async notifyAbsence(
    employee_id: string,
    employee_name: string,
    absence_date: string,
    absence_type: string = 'Absent',
  ): Promise<void> {
    // Get all HR users (for now, we'll use a default user 'hr_admin')
    // In production, this would query for all users with HR role
    const hrUsers = ['hr_admin'];

    const payload: NotificationPayload = {
      employee_id,
      employee_name,
      absence_date,
      absence_type: absence_type.toLowerCase(),
      message: `Employee ${employee_name} (${employee_id}) has an unexcused absence on ${absence_date}`,
    };

    for (const user_id of hrUsers) {
      await this.sendNotification(user_id, payload);
    }
  }

  async notifyLateArrival(
    employee_id: string,
    employee_name: string,
    date: string,
    expected_time: string,
    actual_time: string,
    minutes_late: number,
  ): Promise<void> {
    // Get all HR users
    const hrUsers = ['hr_admin'];

    for (const user_id of hrUsers) {
      const preferences = await this.getOrCreatePreferences(user_id);

      // Check if late arrival notifications are enabled
      if (!preferences.notification_types.includes('late')) {
        this.logger.log(
          `Late arrival notifications not enabled for user ${user_id}`,
        );
        continue;
      }

      const message = `Employee ${employee_name} (${employee_id}) arrived ${minutes_late} minutes late on ${date}. Expected: ${expected_time}, Actual: ${actual_time}`;

      // Send email notification
      if (preferences.email_enabled) {
        await this.emailService.sendEmail({
          to: preferences.email_address || `${user_id}@company.com`,
          subject: `Late Arrival Alert - ${employee_name}`,
          template: 'late-arrival-alert',
          context: {
            employee_id,
            employee_name,
            date,
            expected_time,
            actual_time,
            minutes_late,
          },
          user_id,
        });
      }

      // Send real-time in-app notification
      if (preferences.in_app_enabled) {
        await this.realtimeNotificationService.sendRealTimeNotification(
          user_id,
          'late',
          `Late Arrival - ${employee_name}`,
          message,
          {
            employee_id,
            employee_name,
            date,
            expected_time,
            actual_time,
            minutes_late,
          },
          'warning',
        );
      }
    }
  }
}
