import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditService } from '@/modules/audit/audit.service.js';
import { GenresRepository } from './genres.repository.js';
import { GenresService } from './genres.service.js';
import { GENRE_ERRORS } from './genres.errors.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockGenre = (overrides = {}) => ({
  id: 'genre-1',
  name: 'Ficción',
  slug: 'ficcion',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('GenresService', () => {
  let service: GenresService;
  let repo: Record<keyof GenresRepository, ReturnType<typeof vi.fn>>;
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
        GenresService,
        { provide: GenresRepository, useValue: repo },
        { provide: AuditService, useValue: audit },
        { provide: getLoggerToken(GenresService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(GenresService);
  });

  describe('findById', () => {
    it('retorna el género cuando existe', async () => {
      const genre = mockGenre();
      repo.findById.mockResolvedValue(genre);
      await expect(service.findById('genre-1')).resolves.toBe(genre);
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

    it('crea el género y llama audit.log', async () => {
      const genre = mockGenre();
      repo.create.mockResolvedValue(genre);
      const result = await service.create('Ficción');
      expect(result).toBe(genre);
      expect(audit.log).toHaveBeenCalledWith('CREATE', 'Genre', genre.id, { name: 'Ficción' });
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
      repo.findByName.mockResolvedValue(mockGenre());
      await expect(service.create('Ficción')).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException con DUPLICATE_DELETED si el género está eliminado', async () => {
      repo.findByName.mockResolvedValue(mockGenre({ deletedAt: new Date() }));
      const error = await service.create('Ficción').catch((e) => e);
      expect(error.getResponse()).toMatchObject({ code: GENRE_ERRORS.DUPLICATE_DELETED.code });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repo.findById.mockResolvedValue(mockGenre());
      repo.findByName.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('actualiza el género y llama audit.log', async () => {
      const updated = mockGenre({ name: 'Terror' });
      repo.update.mockResolvedValue(updated);
      const result = await service.update('genre-1', 'Terror');
      expect(result).toBe(updated);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Genre', updated.id, { name: 'Terror' });
    });

    it('lanza NotFoundException si el género no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', 'Terror')).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nombre pertenece a otro género', async () => {
      repo.findByName.mockResolvedValue(mockGenre({ id: 'otro-genre' }));
      await expect(service.update('genre-1', 'Terror')).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('elimina el género y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockGenre());
      await service.softDelete('genre-1');
      expect(repo.softDelete).toHaveBeenCalledWith('genre-1');
      expect(audit.log).toHaveBeenCalledWith('DELETE', 'Genre', 'genre-1', {});
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.softDelete('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está eliminado', async () => {
      repo.findByIdRaw.mockResolvedValue(mockGenre({ deletedAt: new Date() }));
      await expect(service.softDelete('genre-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('restaura el género y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockGenre({ deletedAt: new Date() }));
      const restored = mockGenre();
      repo.restore.mockResolvedValue(restored);
      const result = await service.restore('genre-1');
      expect(result).toBe(restored);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Genre', 'genre-1', { restored: true });
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.restore('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está activo', async () => {
      repo.findByIdRaw.mockResolvedValue(mockGenre({ deletedAt: null }));
      await expect(service.restore('genre-1')).rejects.toThrow(BadRequestException);
    });
  });
});
