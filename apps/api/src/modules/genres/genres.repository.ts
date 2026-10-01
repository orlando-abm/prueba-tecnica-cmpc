import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import type { Genre } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import type { GenreFiltersDto } from './genres.schema.js';

@Injectable()
export class GenresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: GenreFiltersDto): Promise<PaginatedResponse<Genre>> {
    const { search, status, sortBy, order, page, limit } = filters;

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(status === 'active' ? { deletedAt: null } : {}),
      ...(status === 'inactive' ? { deletedAt: { not: null } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.genre.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.genre.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string): Promise<Genre | null> {
    return this.prisma.genre.findFirst({ where: { id, deletedAt: null } });
  }

  findByIdDeleted(id: string): Promise<Genre | null> {
    return this.prisma.genre.findFirst({ where: { id, deletedAt: { not: null } } });
  }

  findByName(name: string): Promise<Genre | null> {
    return this.prisma.genre.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  create(name: string): Promise<Genre> {
    return this.prisma.genre.create({ data: { name } });
  }

  update(id: string, name: string): Promise<Genre> {
    return this.prisma.genre.update({ where: { id }, data: { name } });
  }

  softDelete(id: string): Promise<Genre> {
    return this.prisma.genre.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  restore(id: string): Promise<Genre> {
    return this.prisma.genre.update({ where: { id }, data: { deletedAt: null } });
  }
}
