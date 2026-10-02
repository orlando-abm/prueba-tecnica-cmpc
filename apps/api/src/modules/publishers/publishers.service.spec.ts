import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditService } from '@/modules/audit/audit.service.js';
import { PublishersRepository } from './publishers.repository.js';
import { PublishersService } from './publishers.service.js';
import { PUBLISHER_ERRORS } from './publishers.errors.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockPublisher = (overrides = {}) => ({
  id: 'pub-1',
  name: 'Penguin Books',
  slug: 'penguin-books',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('PublishersService', () => {
  let service: PublishersService;
  let repo: Record<keyof PublishersRepository, ReturnType<typeof vi.fn>>;
  let audit: { log: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIdRaw: vi.fn(),
      findByName: vi.fn(),
      findBySlugRaw: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
    };
    audit = { log: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        { provide: PublishersRepository, useValue: repo },
        { provide: AuditService, useValue: audit },
        { provide: getLoggerToken(PublishersService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(PublishersService);
  });

  describe('findById', () => {
    it('retorna la editorial cuando existe', async () => {
      const pub = mockPublisher();
      repo.findById.mockResolvedValue(pub);
      await expect(service.findById('pub-1')).resolves.toBe(pub);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      repo.findByName.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('crea la editorial y llama audit.log', async () => {
      const pub = mockPublisher();
      repo.create.mockResolvedValue(pub);
      const result = await service.create('Penguin Books');
      expect(result).toBe(pub);
      expect(audit.log).toHaveBeenCalledWith('CREATE', 'Publisher', pub.id, expect.any(Object));
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
      repo.findByName.mockResolvedValue(mockPublisher());
      await expect(service.create('Penguin Books')).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException con DUPLICATE_DELETED si la editorial está eliminada', async () => {
      repo.findByName.mockResolvedValue(mockPublisher({ deletedAt: new Date() }));
      const error = await service.create('Penguin Books').catch((e) => e);
      expect(error.getResponse()).toMatchObject({ code: PUBLISHER_ERRORS.DUPLICATE_DELETED.code });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repo.findById.mockResolvedValue(mockPublisher());
      repo.findByName.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('actualiza la editorial y llama audit.log', async () => {
      const updated = mockPublisher({ name: 'Random House' });
      repo.update.mockResolvedValue(updated);
      const result = await service.update('pub-1', 'Random House');
      expect(result).toBe(updated);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Publisher', updated.id, expect.any(Object));
    });

    it('lanza NotFoundException si la editorial no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', 'Random House')).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nombre pertenece a otra editorial', async () => {
      repo.findByName.mockResolvedValue(mockPublisher({ id: 'otra-pub' }));
      await expect(service.update('pub-1', 'Random House')).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('elimina la editorial y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockPublisher());
      await service.softDelete('pub-1');
      expect(repo.softDelete).toHaveBeenCalledWith('pub-1');
      expect(audit.log).toHaveBeenCalledWith('DELETE', 'Publisher', 'pub-1', {});
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.softDelete('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está eliminada', async () => {
      repo.findByIdRaw.mockResolvedValue(mockPublisher({ deletedAt: new Date() }));
      await expect(service.softDelete('pub-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('restaura la editorial y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockPublisher({ deletedAt: new Date() }));
      const restored = mockPublisher();
      repo.restore.mockResolvedValue(restored);
      const result = await service.restore('pub-1');
      expect(result).toBe(restored);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Publisher', 'pub-1', { restored: true });
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.restore('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está activa', async () => {
      repo.findByIdRaw.mockResolvedValue(mockPublisher({ deletedAt: null }));
      await expect(service.restore('pub-1')).rejects.toThrow(BadRequestException);
    });
  });
});
