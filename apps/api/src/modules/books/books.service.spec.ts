import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditService } from '@/modules/audit/audit.service.js';
import { PrismaService } from '@/database/prisma.service.js';
import { BooksRepository, type BookWithRelations } from './books.repository.js';
import { BooksService } from './books.service.js';
import { BOOK_ERRORS } from './books.errors.js';
import type { BookBodyDto } from './books.schema.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockBook = (overrides: Partial<BookWithRelations> = {}): BookWithRelations =>
  ({
    id: 'book-1',
    title: 'El Principito',
    slug: 'el-principito',
    price: 10,
    stock: 5,
    isbn: null,
    sku: null,
    synopsis: null,
    language: null,
    pages: null,
    year: null,
    imageUrl: null,
    genreId: 'genre-1',
    authorId: 'author-1',
    publisherId: 'publisher-1',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    genre: { id: 'genre-1', name: 'Ficción', slug: 'ficcion', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
    author: { id: 'author-1', name: 'Antoine', slug: 'antoine', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
    publisher: { id: 'publisher-1', name: 'Editorial X', slug: 'editorial-x', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
    ...overrides,
  } as BookWithRelations);

const mockDto = (overrides: Partial<BookBodyDto> = {}): BookBodyDto => ({
  title: 'El Principito',
  authorId: 'author-1',
  publisherId: 'publisher-1',
  genreId: 'genre-1',
  price: 10,
  stock: 5,
  ...overrides,
});

describe('BooksService', () => {
  let service: BooksService;
  let repo: Record<keyof BooksRepository, ReturnType<typeof vi.fn>>;
  let prisma: { genre: { findFirst: ReturnType<typeof vi.fn> }; author: { findFirst: ReturnType<typeof vi.fn> }; publisher: { findFirst: ReturnType<typeof vi.fn> } };
  let audit: { log: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = {
      findAll: vi.fn(),
      findAllForExport: vi.fn(),
      findById: vi.fn(),
      findByIdRaw: vi.fn(),
      findBySlug: vi.fn(),
      findBySlugRaw: vi.fn(),
      findByIsbn: vi.fn(),
      findBySku: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
    };

    prisma = {
      genre: { findFirst: vi.fn() },
      author: { findFirst: vi.fn() },
      publisher: { findFirst: vi.fn() },
    };

    audit = { log: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: BooksRepository, useValue: repo },
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: getLoggerToken(BooksService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(BooksService);
  });

  describe('findAll', () => {
    it('delega los filtros al repositorio', async () => {
      const result = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      repo.findAll.mockResolvedValue(result);
      const filters = { page: 1, limit: 10 } as any;
      await expect(service.findAll(filters)).resolves.toBe(result);
      expect(repo.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findById', () => {
    it('retorna el libro cuando existe', async () => {
      const book = mockBook();
      repo.findById.mockResolvedValue(book);
      await expect(service.findById('book-1', [])).resolves.toBe(book);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('x', [])).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('retorna el libro cuando existe', async () => {
      const book = mockBook();
      repo.findBySlug.mockResolvedValue(book);
      await expect(service.findBySlug('el-principito', [])).resolves.toBe(book);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      repo.findBySlug.mockResolvedValue(null);
      await expect(service.findBySlug('no-existe', [])).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      prisma.genre.findFirst.mockResolvedValue({ id: 'genre-1' });
      prisma.author.findFirst.mockResolvedValue({ id: 'author-1' });
      prisma.publisher.findFirst.mockResolvedValue({ id: 'publisher-1' });
      repo.findByIsbn.mockResolvedValue(null);
      repo.findBySku.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('crea el libro y llama audit.log', async () => {
      const book = mockBook();
      repo.create.mockResolvedValue(book);
      const result = await service.create(mockDto());
      expect(result).toBe(book);
      expect(audit.log).toHaveBeenCalledWith('CREATE', 'Book', book.id, expect.any(Object));
    });

    it('lanza NotFoundException si el género no existe', async () => {
      prisma.genre.findFirst.mockResolvedValue(null);
      await expect(service.create(mockDto())).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si el autor no existe', async () => {
      prisma.author.findFirst.mockResolvedValue(null);
      await expect(service.create(mockDto())).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si la editorial no existe', async () => {
      prisma.publisher.findFirst.mockResolvedValue(null);
      await expect(service.create(mockDto())).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el ISBN ya está en uso', async () => {
      repo.findByIsbn.mockResolvedValue(mockBook({ deletedAt: null }));
      await expect(service.create(mockDto({ isbn: 'ISBN-1' }))).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException si el SKU ya está en uso', async () => {
      repo.findBySku.mockResolvedValue(mockBook({ deletedAt: null }));
      await expect(service.create(mockDto({ sku: 'SKU-1' }))).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException con error ISBN_TAKEN_DELETED si el libro está eliminado', async () => {
      repo.findByIsbn.mockResolvedValue(mockBook({ deletedAt: new Date(), isbn: 'ISBN-1' }));
      const error = await service.create(mockDto({ isbn: 'ISBN-1' })).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ code: BOOK_ERRORS.ISBN_TAKEN_DELETED.code });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repo.findByIdRaw.mockResolvedValue(mockBook());
      prisma.genre.findFirst.mockResolvedValue({ id: 'genre-1' });
      prisma.author.findFirst.mockResolvedValue({ id: 'author-1' });
      prisma.publisher.findFirst.mockResolvedValue({ id: 'publisher-1' });
      repo.findByIsbn.mockResolvedValue(null);
      repo.findBySku.mockResolvedValue(null);
      repo.findBySlugRaw.mockResolvedValue(null);
    });

    it('actualiza el libro y llama audit.log', async () => {
      const book = mockBook();
      repo.update.mockResolvedValue(book);
      const result = await service.update('book-1', mockDto());
      expect(result).toBe(book);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Book', book.id, expect.any(Object));
    });

    it('lanza NotFoundException si el libro no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.update('x', mockDto())).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el ISBN pertenece a otro libro', async () => {
      repo.findByIsbn.mockResolvedValue(mockBook({ id: 'otro-libro', isbn: 'ISBN-X', deletedAt: null }));
      await expect(service.update('book-1', mockDto({ isbn: 'ISBN-X' }))).rejects.toThrow(ConflictException);
    });

    it('no lanza error si el ISBN pertenece al mismo libro', async () => {
      repo.findByIsbn.mockResolvedValue(mockBook({ id: 'book-1', isbn: 'ISBN-X' }));
      repo.update.mockResolvedValue(mockBook());
      await expect(service.update('book-1', mockDto({ isbn: 'ISBN-X' }))).resolves.toBeDefined();
    });
  });

  describe('softDelete', () => {
    it('elimina el libro y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockBook());
      repo.softDelete.mockResolvedValue(undefined);
      await service.softDelete('book-1');
      expect(repo.softDelete).toHaveBeenCalledWith('book-1');
      expect(audit.log).toHaveBeenCalledWith('DELETE', 'Book', 'book-1', {});
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.softDelete('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya está eliminado', async () => {
      repo.findByIdRaw.mockResolvedValue(mockBook({ deletedAt: new Date() }));
      await expect(service.softDelete('book-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('restaura el libro y llama audit.log', async () => {
      repo.findByIdRaw.mockResolvedValue(mockBook({ deletedAt: new Date() }));
      const restored = mockBook();
      repo.restore.mockResolvedValue(restored);
      const result = await service.restore('book-1');
      expect(result).toBe(restored);
      expect(audit.log).toHaveBeenCalledWith('UPDATE', 'Book', 'book-1', { restored: true });
    });

    it('lanza NotFoundException si el libro no existe', async () => {
      repo.findByIdRaw.mockResolvedValue(null);
      await expect(service.restore('x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el libro ya está activo', async () => {
      repo.findByIdRaw.mockResolvedValue(mockBook({ deletedAt: null }));
      await expect(service.restore('book-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportCsv', () => {
    it('retorna CSV con encabezados y filas', async () => {
      repo.findAllForExport.mockResolvedValue([mockBook()]);
      const csv = await service.exportCsv({} as any);
      expect(csv).toContain('Título');
      expect(csv).toContain('El Principito');
      expect(csv).toContain('Antoine');
    });

    it('retorna solo encabezados cuando no hay libros', async () => {
      repo.findAllForExport.mockResolvedValue([]);
      const csv = await service.exportCsv({} as any);
      expect(csv).toContain('Título');
      const lines = csv.trim().split('\r\n');
      expect(lines).toHaveLength(1);
    });
  });
});
