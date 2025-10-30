import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from './email.service';
import { EmailLog, EmailStatus } from './schemas/email-log.schema';

describe('EmailService', () => {
  let service: EmailService;
  let mockEmailLogModel: any;

  const mockEmailLog = {
    _id: 'log123',
    recipient: 'hr@company.com',
    subject: 'Test Email',
    template: 'absence-alert',
    template_data: { employee_name: 'John Doe' },
    status: EmailStatus.QUEUED,
    retry_count: 0,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockEmailLogModel = {
      create: jest.fn().mockResolvedValue(mockEmailLog),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockEmailLog]),
          }),
        }),
      }),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getModelToken(EmailLog.name),
          useValue: mockEmailLogModel,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock the transporter and templates to avoid actual email sending
    (service as any).transporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: jest.fn().mockResolvedValue(true),
    };

    // Mock templates
    (service as any).templates = new Map();
    (service as any).templates.set(
      'absence-alert',
      jest.fn().mockReturnValue('<html>Test Template</html>'),
    );
    (service as any).templates.set(
      'late-arrival-alert',
      jest.fn().mockReturnValue('<html>Late Arrival Template</html>'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should queue an email for sending', async () => {
      const emailOptions = {
        to: 'hr@company.com',
        subject: 'Test Subject',
        template: 'absence-alert',
        context: { employee_name: 'John Doe' },
      };

      const result = await service.sendEmail(emailOptions);

      expect(mockEmailLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: emailOptions.to,
          subject: emailOptions.subject,
          template: emailOptions.template,
          template_data: emailOptions.context,
          status: EmailStatus.QUEUED,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should include user_id if provided', async () => {
      const emailOptions = {
        to: 'hr@company.com',
        subject: 'Test Subject',
        template: 'absence-alert',
        context: { employee_name: 'John Doe' },
        user_id: 'hr_admin',
      };

      await service.sendEmail(emailOptions);

      expect(mockEmailLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'hr_admin',
        }),
      );
    });
  });

  describe('getEmailLogs', () => {
    it('should retrieve email logs', async () => {
      const logs = await service.getEmailLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(mockEmailLog);
    });

    it('should filter by user_id when provided', async () => {
      await service.getEmailLogs('hr_admin');

      expect(mockEmailLogModel.find).toHaveBeenCalledWith({
        user_id: 'hr_admin',
      });
    });

    it('should limit results', async () => {
      await service.getEmailLogs(undefined, 25);

      expect(mockEmailLogModel.find().sort().limit).toHaveBeenCalledWith(25);
    });
  });

  describe('getEmailStats', () => {
    it('should return email statistics', async () => {
      const stats = await service.getEmailStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('sent');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('queued');
      expect(stats.total).toBe(10);
    });
  });

  describe('verifyConnection', () => {
    it('should verify email service connection', async () => {
      const result = await service.verifyConnection();

      expect(result).toBe(true);
      expect((service as any).transporter.verify).toHaveBeenCalled();
    });

    it('should return false if connection fails', async () => {
      (service as any).transporter.verify = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      const result = await service.verifyConnection();

      expect(result).toBe(false);
    });
  });
});
