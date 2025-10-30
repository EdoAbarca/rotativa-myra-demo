import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditLog } from './schemas/audit-log.schema';

describe('AuditService', () => {
  let service: AuditService;

  const mockAuditLog = {
    entity_type: 'Employee',
    entity_id: 'EMP001',
    action: 'create',
    changes: { first_name: 'John', last_name: 'Doe' },
    performed_by: 'hr-employee',
  };

  const mockModel = {
    find: jest.fn(),
    sort: jest.fn(),
    exec: jest.fn(),
  };

  const mockModelConstructor = jest.fn().mockImplementation((dto: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const instance = {
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return instance;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken(AuditLog.name),
          useValue: mockModelConstructor,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);

    // Assign mockModel methods to the model
    Object.assign(service['auditLogModel'], mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create and save an audit log', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockAuditLog);
      mockModelConstructor.mockImplementationOnce((dto: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = {
          ...dto,
          save: saveMock,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instance;
      });

      await service.log(mockAuditLog);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findByEntity', () => {
    it('should return audit logs for an entity', async () => {
      const logs = [mockAuditLog];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(logs),
        }),
      });

      const result = await service.findByEntity('Employee', 'EMP001');
      expect(result).toEqual(logs);
      expect(mockModel.find).toHaveBeenCalledWith({
        entity_type: 'Employee',
        entity_id: 'EMP001',
      });
    });
  });
});
