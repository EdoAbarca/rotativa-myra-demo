import { Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, Subject } from 'rxjs';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

export interface RealTimeNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  severity?: string;
  timestamp: Date;
}

@Injectable()
export class RealtimeNotificationService {
  private readonly logger = new Logger(RealtimeNotificationService.name);
  private notificationStreams: Map<string, Subject<MessageEvent>> = new Map();

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribe(userId: string): Observable<MessageEvent> {
    this.logger.log(`User ${userId} subscribing to real-time notifications`);

    // Get or create a stream for this user
    if (!this.notificationStreams.has(userId)) {
      this.notificationStreams.set(userId, new Subject<MessageEvent>());
    }

    return this.notificationStreams.get(userId)!.asObservable();
  }

  /**
   * Unsubscribe from real-time notifications
   */
  unsubscribe(userId: string): void {
    this.logger.log(
      `User ${userId} unsubscribing from real-time notifications`,
    );
    const stream = this.notificationStreams.get(userId);
    if (stream) {
      stream.complete();
      this.notificationStreams.delete(userId);
    }
  }

  /**
   * Send a real-time notification to a user
   */
  async sendRealTimeNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    severity: string = 'info',
  ): Promise<NotificationDocument> {
    this.logger.log(
      `Sending real-time notification to user ${userId}: ${title}`,
    );

    // Store notification in database
    const notification = await this.notificationModel.create({
      user_id: userId,
      type,
      title,
      message,
      data,
      severity,
      read: false,
    });

    // Send to real-time stream if user is subscribed
    const stream = this.notificationStreams.get(userId);
    if (stream) {
      const payload: RealTimeNotification = {
        id: String(notification._id),
        user_id: userId,
        type,
        title,
        message,
        data,
        severity,
        timestamp:
          (notification as unknown as { createdAt: Date }).createdAt ||
          new Date(),
      };

      const event: MessageEvent = {
        data: JSON.stringify(payload),
      };

      stream.next(event);
      this.logger.log(`Real-time notification delivered to user ${userId}`);
    } else {
      this.logger.log(
        `User ${userId} not subscribed, notification stored for later retrieval`,
      );
    }

    return notification;
  }

  /**
   * Get notification history for a user
   */
  async getNotifications(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const filter: Record<string, unknown> = { user_id: userId };

    if (query.read !== undefined) {
      filter.read = query.read;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.severity) {
      filter.severity = query.severity;
    }

    if (query.start_date || query.end_date) {
      filter.createdAt = {};
      if (query.start_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.createdAt as any).$gte = new Date(query.start_date);
      }
      if (query.end_date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (filter.createdAt as any).$lte = new Date(query.end_date);
      }
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel
        .countDocuments({ user_id: userId, read: false })
        .exec(),
    ]);

    return {
      notifications,
      total,
      unread: unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationDocument | null> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, user_id: userId },
        { read: true, read_at: new Date() },
        { new: true },
      )
      .exec();

    if (notification) {
      this.logger.log(`Notification ${notificationId} marked as read`);
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { user_id: userId, read: false },
        { read: true, read_at: new Date() },
      )
      .exec();

    this.logger.log(
      `Marked ${result.modifiedCount} notifications as read for user ${userId}`,
    );
    return result.modifiedCount;
  }

  /**
   * Update a notification
   */
  async updateNotification(
    notificationId: string,
    userId: string,
    updateDto: UpdateNotificationDto,
  ): Promise<NotificationDocument | null> {
    const update: Record<string, unknown> = {};

    if (updateDto.read !== undefined) {
      update.read = updateDto.read;
      if (updateDto.read) {
        update.read_at = new Date();
      }
    }

    return this.notificationModel
      .findOneAndUpdate({ _id: notificationId, user_id: userId }, update, {
        new: true,
      })
      .exec();
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationModel
      .deleteMany({ createdAt: { $lt: cutoffDate }, read: true })
      .exec();

    this.logger.log(
      `Deleted ${result.deletedCount} old notifications (older than ${daysOld} days)`,
    );
    return result.deletedCount;
  }

  /**
   * Get notification statistics for a user
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    unread: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
  }> {
    const notifications = await this.notificationModel
      .find({ user_id: userId })
      .exec();

    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    notifications.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      if (n.severity) {
        bySeverity[n.severity] = (bySeverity[n.severity] || 0) + 1;
      }
    });

    return {
      total,
      unread,
      by_type: byType,
      by_severity: bySeverity,
    };
  }
}
