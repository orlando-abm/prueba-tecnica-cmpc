import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service.js';
import { getCurrentUserId } from '@/common/context/request-context.js';
import type { AuditLogFiltersDto } from '@repo/shared/schemas/audit-log.schema';

export { AuditAction };

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    action: AuditAction,
    entity: string,
    entityId: string,
    metadata: Record<string, unknown>,
  ): void {
    const userId = getCurrentUserId(); // captura síncrona antes de salir del contexto
    if (!userId) return;
    this.prisma.auditLog
      .create({
        data: {
          action,
          entity,
          entityId,
          metadata: metadata as Prisma.InputJsonValue,
          userId,
        },
      })
      .catch(() => {}); // fire-and-forget: nunca bloquea ni rompe el response
  }

  async findAll(filters: AuditLogFiltersDto) {
    const { entity, action, page, limit } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {
      ...(entity ? { entity } : {}),
      ...(action ? { action } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
