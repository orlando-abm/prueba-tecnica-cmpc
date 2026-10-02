import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '@/database/prisma.service.js';
import { AuditService, AuditAction } from './audit.service.js';
import * as requestContext from '@/common/context/request-context.js';

const mockPrisma = {
  auditLog: {
    create: vi.fn().mockResolvedValue({}),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  describe('log', () => {
    it('no hace nada si no hay userId en el contexto', () => {
      vi.spyOn(requestContext, 'getCurrentUserId').mockReturnValue(undefined);
      service.log(AuditAction.CREATE, 'Book', 'book-1', { title: 'Test' });
      expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('crea el registro de auditoría cuando hay userId', () => {
      vi.spyOn(requestContext, 'getCurrentUserId').mockReturnValue('user-1');
      service.log(AuditAction.CREATE, 'Book', 'book-1', { title: 'Test' });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: AuditAction.CREATE,
          entity: 'Book',
          entityId: 'book-1',
          metadata: { title: 'Test' },
          userId: 'user-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('retorna los logs paginados sin filtros', async () => {
      const items = [{ id: 'log-1', entity: 'Book', action: AuditAction.CREATE }];
      mockPrisma.$transaction.mockResolvedValue([items, 1]);
      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result).toEqual({ items, total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('filtra por entity y action', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);
      await service.findAll({ entity: 'Book', action: AuditAction.DELETE, page: 1, limit: 10 } as any);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('calcula totalPages correctamente', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 25]);
      const result = await service.findAll({ page: 2, limit: 10 } as any);
      expect(result.totalPages).toBe(3);
    });
  });
});
