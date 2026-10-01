import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import type { Author } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import type { AuthorFiltersDto } from './authors.schema.js';

@Injectable()
export class AuthorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: AuthorFiltersDto): Promise<PaginatedResponse<Author>> {
    const { search, status, sortBy, order, page, limit } = filters;

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(status === 'active' ? { deletedAt: null } : {}),
      ...(status === 'inactive' ? { deletedAt: { not: null } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.author.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.author.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { id, deletedAt: null } });
  }

  findByIdRaw(id: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { id } });
  }

  findByIdDeleted(id: string): Promise<Author | null> {
    return this.prisma.author.findFirst({ where: { id, deletedAt: { not: null } } });
  }

  findByName(name: string): Promise<Author | null> {
    return this.prisma.author.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  create(name: string): Promise<Author> {
    return this.prisma.author.create({ data: { name } });
  }

  update(id: string, name: string): Promise<Author> {
    return this.prisma.author.update({ where: { id }, data: { name } });
  }

  softDelete(id: string): Promise<Author> {
    return this.prisma.author.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  restore(id: string): Promise<Author> {
    return this.prisma.author.update({ where: { id }, data: { deletedAt: null } });
  }
}
