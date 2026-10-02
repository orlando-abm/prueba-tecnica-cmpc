import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import type { BookWithRelations } from './books.repository.js';
import type { BookFiltersDto } from './books.schema.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockBook = (): BookWithRelations =>
  ({
    id: 'book-1',
    title: 'El Principito',
    slug: 'el-principito',
    price: 10,
    stock: 5,
    isbn: null,
    sku: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    genre: { id: 'g1', name: 'Ficción', slug: 'ficcion', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
    author: { id: 'a1', name: 'Antoine', slug: 'antoine', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
    publisher: { id: 'p1', name: 'Ed. X', slug: 'ed-x', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
  } as BookWithRelations);

describe('BooksController', () => {
  let controller: BooksController;
  let service: Record<keyof BooksService, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
      exportCsv: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: service },
        { provide: getLoggerToken(BooksController.name), useValue: mockLogger },
      ],
    }).compile();

    controller = module.get(BooksController);
  });

  describe('findAll', () => {
    it('llama a service.findAll con los filtros recibidos', async () => {
      const result = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      service.findAll.mockResolvedValue(result);
      const filters = { page: 1, limit: 10 } as BookFiltersDto;
      await expect(controller.findAll(filters)).resolves.toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findById', () => {
    it('llama a service.findById y filtra solo includes permitidos', async () => {
      service.findById.mockResolvedValue(mockBook());
      await controller.findById('book-1', ['genre', 'hack']);
      expect(service.findById).toHaveBeenCalledWith('book-1', ['genre']);
    });

    it('pasa array vacío cuando include es undefined', async () => {
      service.findById.mockResolvedValue(mockBook());
      await controller.findById('book-1', undefined);
      expect(service.findById).toHaveBeenCalledWith('book-1', []);
    });
  });

  describe('findBySlug', () => {
    it('llama a service.findBySlug con el slug recibido', async () => {
      service.findBySlug.mockResolvedValue(mockBook());
      await controller.findBySlug('el-principito', 'author');
      expect(service.findBySlug).toHaveBeenCalledWith('el-principito', ['author']);
    });
  });

  describe('create', () => {
    it('llama a service.create y retorna el libro', async () => {
      const book = mockBook();
      service.create.mockResolvedValue(book);
      const dto = { title: 'El Principito', price: 10, stock: 5, genreId: 'g1', authorId: 'a1', publisherId: 'p1' } as any;
      await expect(controller.create(dto)).resolves.toBe(book);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('llama a service.update con id y dto', async () => {
      const book = mockBook();
      service.update.mockResolvedValue(book);
      const dto = { title: 'Nuevo', price: 20, stock: 0, genreId: 'g1', authorId: 'a1', publisherId: 'p1' } as any;
      await expect(controller.update('book-1', dto)).resolves.toBe(book);
      expect(service.update).toHaveBeenCalledWith('book-1', dto);
    });
  });

  describe('softDelete', () => {
    it('llama a service.softDelete con el id', async () => {
      service.softDelete.mockResolvedValue(undefined);
      await controller.softDelete('book-1');
      expect(service.softDelete).toHaveBeenCalledWith('book-1');
    });
  });

  describe('restore', () => {
    it('llama a service.restore con el id', async () => {
      const book = mockBook();
      service.restore.mockResolvedValue(book);
      await expect(controller.restore('book-1')).resolves.toBe(book);
      expect(service.restore).toHaveBeenCalledWith('book-1');
    });
  });
});
