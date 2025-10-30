import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification.service';
import { AbsenceDetectionService } from './absence-detection.service';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './schemas/notification-preference.schema';
import {
  AbsenceAlert,
  AbsenceAlertSchema,
} from './schemas/absence-alert.schema';
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
    ]),
    AttendanceModule,
    EmployeesModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationService, AbsenceDetectionService],
  exports: [NotificationService, AbsenceDetectionService],
})
export class NotificationsModule {}
