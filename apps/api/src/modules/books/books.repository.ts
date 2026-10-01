import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import type { Book, Prisma } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import type { BookFiltersDto } from './books.schema.js';
import { BOOK_INCLUDES } from './books.constants.js';

export type BookWithRelations = Prisma.BookGetPayload<{ include: typeof BOOK_INCLUDES }>;

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: BookFiltersDto): Promise<PaginatedResponse<BookWithRelations>> {
    const {
      search,
      slug,
      status,
      genreId,
      authorId,
      publisherId,
      available,
      sortBy,
      order,
      page,
      limit,
      include,
    } = filters;
    const where = this.buildWhere({
      search,
      slug,
      status,
      genreId,
      authorId,
      publisherId,
      available,
    });
    const inc = this.buildIncludes(include);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: inc,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findAllForExport(filters: Omit<BookFiltersDto, 'page' | 'limit'>): Promise<BookWithRelations[]> {
    const { search, slug, status, genreId, authorId, publisherId, available, sortBy, order } =
      filters;
    const where = this.buildWhere({
      search,
      slug,
      status,
      genreId,
      authorId,
      publisherId,
      available,
    });
    return this.prisma.book.findMany({
      where,
      include: { genre: true, author: true, publisher: true },
      orderBy: { [sortBy]: order },
    });
  }

  findById(id: string, include: string[]): Promise<BookWithRelations | null> {
    return this.prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: this.buildIncludes(include),
    });
  }

  findByIdRaw(id: string): Promise<Book | null> {
    return this.prisma.book.findFirst({ where: { id } });
  }

  findBySlug(slug: string, include: string[]): Promise<BookWithRelations | null> {
    return this.prisma.book.findFirst({
      where: { slug, deletedAt: null },
      include: this.buildIncludes(include),
    });
  }

  findBySlugRaw(slug: string): Promise<Book | null> {
    return this.prisma.book.findFirst({ where: { slug } });
  }

  findByIsbn(isbn: string): Promise<Book | null> {
    return this.prisma.book.findFirst({ where: { isbn } });
  }

  findBySku(sku: string): Promise<Book | null> {
    return this.prisma.book.findFirst({ where: { sku } });
  }

  create(data: Prisma.BookCreateInput, include: string[]): Promise<BookWithRelations> {
    return this.prisma.book.create({ data, include: this.buildIncludes(include) });
  }

  update(id: string, data: Prisma.BookUpdateInput, include: string[]): Promise<BookWithRelations> {
    return this.prisma.book.update({ where: { id }, data, include: this.buildIncludes(include) });
  }

  softDelete(id: string): Promise<Book> {
    return this.prisma.book.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  restore(id: string): Promise<BookWithRelations> {
    return this.prisma.book.update({
      where: { id },
      data: { deletedAt: null },
      include: BOOK_INCLUDES,
    });
  }

  private buildIncludes(includes: string[]) {
    return {
      genre: includes.includes('genre'),
      author: includes.includes('author'),
      publisher: includes.includes('publisher'),
    };
  }

  private buildWhere(
    f: Pick<
      BookFiltersDto,
      'search' | 'slug' | 'status' | 'genreId' | 'authorId' | 'publisherId' | 'available'
    >,
  ): Prisma.BookWhereInput {
    return {
      ...(f.search ? { title: { contains: f.search, mode: 'insensitive' as const } } : {}),
      ...(f.slug ? { slug: f.slug } : {}),
      ...(f.status === 'active' ? { deletedAt: null } : {}),
      ...(f.status === 'inactive' ? { deletedAt: { not: null } } : {}),
      ...(f.genreId ? { genreId: f.genreId } : {}),
      ...(f.authorId ? { authorId: f.authorId } : {}),
      ...(f.publisherId ? { publisherId: f.publisherId } : {}),
      ...(f.available === 'true' ? { stock: { gt: 0 }, deletedAt: null } : {}),
      ...(f.available === 'false' ? { OR: [{ stock: 0 }, { deletedAt: { not: null } }] } : {}),
    };
  }
}
