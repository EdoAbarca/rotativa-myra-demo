import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import {
  EmailLog,
  EmailLogDocument,
  EmailStatus,
} from './schemas/email-log.schema';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  user_id?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 60000; // 1 minute

  constructor(
    @InjectModel(EmailLog.name)
    private emailLogModel: Model<EmailLogDocument>,
  ) {
    this.initializeTransporter();
    this.loadTemplates();
    this.startRetryWorker();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // Only create real transporter if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.logger.log('Email transporter initialized with SMTP configuration');
    } else {
      this.logger.warn(
        'Email credentials not configured. Emails will be logged but not sent.',
      );
      // Create a test transporter for development
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');

    try {
      if (fs.existsSync(templatesDir)) {
        const files = fs.readdirSync(templatesDir);

        files.forEach((file) => {
          if (file.endsWith('.hbs')) {
            const templateName = file.replace('.hbs', '');
            const templatePath = path.join(templatesDir, file);
            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            const compiledTemplate = Handlebars.compile(templateContent);
            this.templates.set(templateName, compiledTemplate);
            this.logger.log(`Loaded email template: ${templateName}`);
          }
        });
      } else {
        this.logger.warn(`Templates directory not found: ${templatesDir}`);
      }
    } catch (error) {
      this.logger.error(
        `Error loading email templates: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailLogDocument> {
    // Create email log entry
    const emailLog = await this.emailLogModel.create({
      recipient: options.to,
      subject: options.subject,
      template: options.template,
      template_data: options.context,
      status: EmailStatus.QUEUED,
      user_id: options.user_id,
    });

    // Try to send immediately
    await this.processSendEmail(emailLog);

    return emailLog;
  }

  private async processSendEmail(emailLog: EmailLogDocument): Promise<boolean> {
    try {
      const template = this.templates.get(emailLog.template);

      if (!template) {
        throw new Error(`Template not found: ${emailLog.template}`);
      }

      const html = template(emailLog.template_data);

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Rotativa MYRA'} <${process.env.EMAIL_FROM || 'noreply@company.com'}>`,
        to: emailLog.recipient,
        subject: emailLog.subject,
        html: String(html),
      };

      const info = (await this.transporter.sendMail(mailOptions)) as {
        messageId: string;
      };

      // Update email log
      emailLog.status = EmailStatus.SENT;
      emailLog.sent_at = new Date();
      emailLog.message_id = info.messageId;
      await emailLog.save();

      this.logger.log(
        `Email sent successfully to ${emailLog.recipient}: ${info.messageId}`,
      );

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send email to ${emailLog.recipient}: ${errorMessage}`,
      );

      // Update email log with error
      emailLog.status = EmailStatus.FAILED;
      emailLog.error_message = errorMessage;
      emailLog.retry_count += 1;

      // Schedule retry if not exceeded max retries
      if (emailLog.retry_count < this.MAX_RETRIES) {
        emailLog.next_retry_at = new Date(
          Date.now() + this.RETRY_DELAY_MS * emailLog.retry_count,
        );
        this.logger.log(
          `Email retry scheduled for ${emailLog.recipient} at ${emailLog.next_retry_at.toISOString()}`,
        );
      }

      await emailLog.save();
      return false;
    }
  }

  private startRetryWorker() {
    // Check for failed emails every minute
    const retryWorker = () => {
      void (async () => {
        try {
          const now = new Date();
          const failedEmails = await this.emailLogModel
            .find({
              status: EmailStatus.FAILED,
              retry_count: { $lt: this.MAX_RETRIES },
              next_retry_at: { $lte: now },
            })
            .limit(10)
            .exec();

          if (failedEmails.length > 0) {
            this.logger.log(
              `Processing ${failedEmails.length} failed emails for retry`,
            );

            for (const emailLog of failedEmails) {
              await this.processSendEmail(emailLog);
            }
          }
        } catch (error) {
          this.logger.error(
            `Error in retry worker: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      })();
    };

    setInterval(retryWorker, this.RETRY_DELAY_MS);

    this.logger.log('Email retry worker started');
  }

  async getEmailLogs(
    user_id?: string,
    limit: number = 50,
  ): Promise<EmailLogDocument[]> {
    const query = user_id ? { user_id } : {};
    return this.emailLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getEmailStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    queued: number;
  }> {
    const [total, sent, failed, pending, queued] = await Promise.all([
      this.emailLogModel.countDocuments().exec(),
      this.emailLogModel.countDocuments({ status: EmailStatus.SENT }).exec(),
      this.emailLogModel.countDocuments({ status: EmailStatus.FAILED }).exec(),
      this.emailLogModel.countDocuments({ status: EmailStatus.PENDING }).exec(),
      this.emailLogModel.countDocuments({ status: EmailStatus.QUEUED }).exec(),
    ]);

    return { total, sent, failed, pending, queued };
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error(
        `Email service connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
