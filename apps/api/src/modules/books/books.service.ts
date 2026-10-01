import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service.js';
import { generateUniqueSlug } from '@common/utils/slugify.js';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { BooksRepository, type BookWithRelations } from './books.repository.js';
import { BOOK_ERRORS } from './books.errors.js';
import type { BookBodyDto, BookFiltersDto } from './books.schema.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectPinoLogger(BooksService.name)
    private readonly logger: PinoLogger,
    private readonly books: BooksRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(filters: BookFiltersDto): Promise<PaginatedResponse<BookWithRelations>> {
    this.logger.info({ filters }, 'Listar libros');
    return this.books.findAll(filters);
  }

  async findById(id: string, include: string[]): Promise<BookWithRelations> {
    this.logger.info({ id }, 'Obtener libro por id');
    const book = await this.books.findById(id, include);
    if (!book) {
      this.logger.warn({ id, code: BOOK_ERRORS.NOT_FOUND.code }, 'Libro no encontrado');
      throw new NotFoundException(BOOK_ERRORS.NOT_FOUND);
    }
    return book;
  }

  async findBySlug(slug: string, include: string[]): Promise<BookWithRelations> {
    this.logger.info({ slug }, 'Obtener libro por slug');
    const book = await this.books.findBySlug(slug, include);
    if (!book) {
      this.logger.warn({ slug, code: BOOK_ERRORS.NOT_FOUND.code }, 'Libro no encontrado');
      throw new NotFoundException(BOOK_ERRORS.NOT_FOUND);
    }
    return book;
  }

  async create(dto: BookBodyDto): Promise<BookWithRelations> {
    this.logger.info({ title: dto.title }, 'Crear libro');
    await this.validateRelations(dto);
    await this.validateIsbn(dto.isbn);
    await this.validateSku(dto.sku);
    const slug = await generateUniqueSlug(dto.title, async (s) => {
      const bySlug = await this.books.findBySlugRaw(s);
      return bySlug !== null;
    });

    let book: BookWithRelations;
    try {
      book = await this.books.create(
        {
          title: dto.title,
          slug,
          price: dto.price,
          stock: dto.stock ?? 0,
          isbn: dto.isbn ?? null,
          sku: dto.sku ?? null,
          synopsis: dto.synopsis ?? null,
          language: dto.language ?? null,
          pages: dto.pages ?? null,
          year: dto.year ?? null,
          imageUrl: dto.imageUrl ?? null,
          genre: { connect: { id: dto.genreId } },
          author: { connect: { id: dto.authorId } },
          publisher: { connect: { id: dto.publisherId } },
        },
        ['genre', 'author', 'publisher'],
      );
    } catch (error) {
      throw this.mapSlugConflict(error);
    }
    this.logger.info({ bookId: book.id }, 'Libro creado');
    return book;
  }

  async update(id: string, dto: BookBodyDto): Promise<BookWithRelations> {
    this.logger.info({ id, title: dto.title }, 'Actualizar libro');
    const existing = await this.books.findByIdRaw(id);
    if (!existing) {
      this.logger.warn(
        { id, code: BOOK_ERRORS.NOT_FOUND.code },
        'Actualizar fallido — libro no encontrado',
      );
      throw new NotFoundException(BOOK_ERRORS.NOT_FOUND);
    }
    await this.validateRelations(dto);

    if (dto.isbn) {
      const byIsbn = await this.books.findByIsbn(dto.isbn);
      if (byIsbn && byIsbn.id !== id) {
        const error =
          byIsbn.deletedAt !== null ? BOOK_ERRORS.ISBN_TAKEN_DELETED : BOOK_ERRORS.ISBN_TAKEN;
        this.logger.warn(
          { id, isbn: dto.isbn, code: error.code },
          'Actualizar fallido — ISBN en uso',
        );
        throw new ConflictException(error);
      }
    }
    if (dto.sku) {
      const bySku = await this.books.findBySku(dto.sku);
      if (bySku && bySku.id !== id) {
        const error =
          bySku.deletedAt !== null ? BOOK_ERRORS.SKU_TAKEN_DELETED : BOOK_ERRORS.SKU_TAKEN;
        this.logger.warn({ id, sku: dto.sku, code: error.code }, 'Actualizar fallido — SKU en uso');
        throw new ConflictException(error);
      }
    }

    let slug: string | undefined;
    if (dto.title !== existing.title) {
      slug = await generateUniqueSlug(dto.title, async (s) => {
        const bySlug = await this.books.findBySlugRaw(s);
        return bySlug !== null && bySlug.id !== id;
      });
    }

    let book: BookWithRelations;
    try {
      book = await this.books.update(
        id,
        {
          title: dto.title,
          ...(slug !== undefined ? { slug } : {}),
          price: dto.price,
          stock: dto.stock ?? 0,
          isbn: dto.isbn ?? null,
          sku: dto.sku ?? null,
          synopsis: dto.synopsis ?? null,
          language: dto.language ?? null,
          pages: dto.pages ?? null,
          year: dto.year ?? null,
          imageUrl: dto.imageUrl ?? null,
          genre: { connect: { id: dto.genreId } },
          author: { connect: { id: dto.authorId } },
          publisher: { connect: { id: dto.publisherId } },
        },
        ['genre', 'author', 'publisher'],
      );
    } catch (error) {
      throw this.mapSlugConflict(error);
    }
    this.logger.info({ bookId: book.id }, 'Libro actualizado');
    return book;
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info({ id }, 'Eliminar libro');
    const book = await this.books.findByIdRaw(id);
    if (!book) {
      this.logger.warn(
        { id, code: BOOK_ERRORS.NOT_FOUND.code },
        'Eliminar fallido — libro no encontrado',
      );
      throw new NotFoundException(BOOK_ERRORS.NOT_FOUND);
    }
    if (book.deletedAt !== null) {
      this.logger.warn(
        { id, code: BOOK_ERRORS.ALREADY_DELETED.code },
        'Eliminar fallido — libro ya está eliminado',
      );
      throw new BadRequestException(BOOK_ERRORS.ALREADY_DELETED);
    }
    await this.books.softDelete(id);
    this.logger.info({ bookId: id }, 'Libro eliminado');
  }

  async restore(id: string): Promise<BookWithRelations> {
    this.logger.info({ id }, 'Restaurar libro');
    const book = await this.books.findByIdRaw(id);
    if (!book) {
      this.logger.warn(
        { id, code: BOOK_ERRORS.NOT_FOUND.code },
        'Restaurar fallido — libro no encontrado',
      );
      throw new NotFoundException(BOOK_ERRORS.NOT_FOUND);
    }
    if (book.deletedAt === null) {
      this.logger.warn(
        { id, code: BOOK_ERRORS.NOT_ACTIVE.code },
        'Restaurar fallido — libro ya está activo',
      );
      throw new BadRequestException(BOOK_ERRORS.NOT_ACTIVE);
    }
    const restored = await this.books.restore(id);
    this.logger.info({ bookId: id }, 'Libro restaurado');
    return restored;
  }

  async exportCsv(filters: Omit<BookFiltersDto, 'page' | 'limit'>): Promise<string> {
    this.logger.info({ filters }, 'Exportar libros CSV');
    const books = await this.books.findAllForExport(filters);
    return this.toCsv(books);
  }

  private mapSlugConflict(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      this.logger.warn({ code: BOOK_ERRORS.SLUG_CONFLICT.code }, 'Conflicto de slug inesperado');
      return new ConflictException(BOOK_ERRORS.SLUG_CONFLICT);
    }
    return error;
  }

  private async validateRelations(dto: BookBodyDto): Promise<void> {
    const genre = await this.prisma.genre.findFirst({
      where: { id: dto.genreId, deletedAt: null },
    });
    if (!genre) {
      this.logger.warn(
        { genreId: dto.genreId, code: BOOK_ERRORS.GENRE_NOT_FOUND.code },
        'Género no encontrado',
      );
      throw new NotFoundException(BOOK_ERRORS.GENRE_NOT_FOUND);
    }
    const author = await this.prisma.author.findFirst({
      where: { id: dto.authorId, deletedAt: null },
    });
    if (!author) {
      this.logger.warn(
        { authorId: dto.authorId, code: BOOK_ERRORS.AUTHOR_NOT_FOUND.code },
        'Autor no encontrado',
      );
      throw new NotFoundException(BOOK_ERRORS.AUTHOR_NOT_FOUND);
    }
    const publisher = await this.prisma.publisher.findFirst({
      where: { id: dto.publisherId, deletedAt: null },
    });
    if (!publisher) {
      this.logger.warn(
        { publisherId: dto.publisherId, code: BOOK_ERRORS.PUBLISHER_NOT_FOUND.code },
        'Editorial no encontrada',
      );
      throw new NotFoundException(BOOK_ERRORS.PUBLISHER_NOT_FOUND);
    }
  }

  private async validateIsbn(isbn?: string): Promise<void> {
    if (!isbn) return;
    const existing = await this.books.findByIsbn(isbn);
    if (existing) {
      const error =
        existing.deletedAt !== null ? BOOK_ERRORS.ISBN_TAKEN_DELETED : BOOK_ERRORS.ISBN_TAKEN;
      this.logger.warn({ isbn, code: error.code }, 'Crear fallido — ISBN en uso');
      throw new ConflictException(error);
    }
  }

  private async validateSku(sku?: string): Promise<void> {
    if (!sku) return;
    const existing = await this.books.findBySku(sku);
    if (existing) {
      const error =
        existing.deletedAt !== null ? BOOK_ERRORS.SKU_TAKEN_DELETED : BOOK_ERRORS.SKU_TAKEN;
      this.logger.warn({ sku, code: error.code }, 'Crear fallido — SKU en uso');
      throw new ConflictException(error);
    }
  }

  private toCsv(books: BookWithRelations[]): string {
    const headers = [
      'Título',
      'Autor',
      'Editorial',
      'Género',
      'Precio',
      'Stock',
      'ISBN',
      'SKU',
      'Año',
      'Idioma',
    ];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = books.map((b) =>
      [
        b.title,
        b.author.name,
        b.publisher.name,
        b.genre.name,
        b.price.toString(),
        b.stock,
        b.isbn ?? '',
        b.sku ?? '',
        b.year ?? '',
        b.language ?? '',
      ]
        .map(esc)
        .join(','),
    );
    return '﻿' + [headers.map(esc).join(','), ...rows].join('\r\n');
  }
}
