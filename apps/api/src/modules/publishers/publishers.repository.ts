import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import type { Publisher } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import type { PublisherFiltersDto } from './publishers.schema.js';

@Injectable()
export class PublishersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: PublisherFiltersDto): Promise<PaginatedResponse<Publisher>> {
    const { search, status, sortBy, order, page, limit } = filters;

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(status === 'active' ? { deletedAt: null } : {}),
      ...(status === 'inactive' ? { deletedAt: { not: null } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.publisher.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.publisher.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string): Promise<Publisher | null> {
    return this.prisma.publisher.findFirst({ where: { id, deletedAt: null } });
  }

  findByIdRaw(id: string): Promise<Publisher | null> {
    return this.prisma.publisher.findFirst({ where: { id } });
  }

  findByIdDeleted(id: string): Promise<Publisher | null> {
    return this.prisma.publisher.findFirst({ where: { id, deletedAt: { not: null } } });
  }

  findByName(name: string): Promise<Publisher | null> {
    return this.prisma.publisher.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  create(name: string): Promise<Publisher> {
    return this.prisma.publisher.create({ data: { name } });
  }

  update(id: string, name: string): Promise<Publisher> {
    return this.prisma.publisher.update({ where: { id }, data: { name } });
  }

  softDelete(id: string): Promise<Publisher> {
    return this.prisma.publisher.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  restore(id: string): Promise<Publisher> {
    return this.prisma.publisher.update({ where: { id }, data: { deletedAt: null } });
  }
}
