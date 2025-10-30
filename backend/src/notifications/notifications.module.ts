import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification.service';
import { AbsenceDetectionService } from './absence-detection.service';
import { LateArrivalDetectionService } from './late-arrival-detection.service';
import { RealtimeNotificationService } from './realtime-notification.service';
import { EmailService } from './email.service';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './schemas/notification-preference.schema';
import {
  AbsenceAlert,
  AbsenceAlertSchema,
} from './schemas/absence-alert.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  EmailLog,
  EmailLogSchema,
} from './schemas/email-log.schema';
import { AttendanceModule } from '../attendance/attendance.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
      { name: AbsenceAlert.name, schema: AbsenceAlertSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    AttendanceModule,
    EmployeesModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    AbsenceDetectionService,
    LateArrivalDetectionService,
    RealtimeNotificationService,
    EmailService,
  ],
  exports: [
    NotificationService,
    AbsenceDetectionService,
    LateArrivalDetectionService,
    RealtimeNotificationService,
    EmailService,
  ],
})
export class NotificationsModule {}
