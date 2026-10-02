import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditService } from '@/modules/audit/audit.service.js';
import { AuthorsRepository } from './authors.repository.js';
import { AuthorsService } from './authors.service.js';
import { AUTHOR_ERRORS } from './authors.errors.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockAuthor = (overrides = {}) => ({
  id: 'author-1',
  name: 'Gabriel García Márquez',
  slug: 'gabriel-garcia-marquez',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AuthorsService', () => {
  let service: AuthorsService;
  let repo: Record<keyof AuthorsRepository, ReturnType<typeof vi.fn>>;
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
        AuthorsService,
        { provide: AuthorsRepository, useValue: repo },
        { provide: AuditService, useValue: audit },
        { provide: getLoggerToken(AuthorsService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(AuthorsService);
  });

  describe('findById', () => {
    it('retorna el autor cuando existe', async () => {
      const author = mockAuthor();
      repo.findById.mockResolvedValue(author);
      await expect(service.findById('author-1')).resolves.toBe(author);
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

    it('crea el autor y llama audit.log', async () => {
      const author = mockAuthor();
      repo.create.mockResolvedValue(author);
      const result = await service.create('Gabriel García Márquez');
      expect(result).toBe(author);
      expect(audit.log).toHaveBeenCalledWith('CREATE', 'Author', author.id, expect.any(Object));
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
      repo.findByName.mockResolvedValue(mockAuthor());
      await expect(service.create('Gabriel García Márquez')).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException con DUPLICATE_DELETED si el autor está eliminado', async () => {
      repo.findByName.mockResolvedValue(mockAuthor({ deletedAt: new Date() }));
      const error = await service.create('Gabriel García Márquez').catch((e) => e);
      expect(error.getResponse()).toMatchObject({ code: AUTHOR_ERRORS.DUPLICATE_DELETED.code });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repo.findById.mockResolvedValue(mockAuthor());
      repo.findByName.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('actualiza el autor y llama audit.log', async () => {
      const updated = mockAuthor({ name: 'Pablo Neruda' });
      repo.update.mockResolvedValue(updated);
      const result = await service.update('author-1', 'Pablo Neruda');
      expect(result).toBe(updated);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Author', updated.id, expect.any(Object));
    });

    it('lanza NotFoundException si el autor no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', 'Neruda')).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nombre pertenece a otro autor', async () => {
      repo.findByName.mockResolvedValue(mockAuthor({ id: 'otro-author' }));
      await expect(service.update('author-1', 'Pablo Neruda')).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('elimina el autor y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockAuthor());
      await service.softDelete('author-1');
      expect(repo.softDelete).toHaveBeenCalledWith('author-1');
      expect(audit.log).toHaveBeenCalledWith('DELETE', 'Author', 'author-1', {});
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.softDelete('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está eliminado', async () => {
      repo.findByIdRaw.mockResolvedValue(mockAuthor({ deletedAt: new Date() }));
      await expect(service.softDelete('author-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('restaura el autor y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockAuthor({ deletedAt: new Date() }));
      const restored = mockAuthor();
      repo.restore.mockResolvedValue(restored);
      const result = await service.restore('author-1');
      expect(result).toBe(restored);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Author', 'author-1', { restored: true });
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.restore('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está activo', async () => {
      repo.findByIdRaw.mockResolvedValue(mockAuthor({ deletedAt: null }));
      await expect(service.restore('author-1')).rejects.toThrow(BadRequestException);
    });
  });
});
