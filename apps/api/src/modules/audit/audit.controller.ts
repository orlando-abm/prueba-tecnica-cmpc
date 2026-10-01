import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { AuditService } from './audit.service.js';
import { AuditLogFiltersSchema } from '@repo/shared/schemas/audit-log.schema';
import { createZodDto } from 'nestjs-zod';

class AuditLogFiltersDto extends createZodDto(AuditLogFiltersSchema) {}

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  findAll(@Query() filters: AuditLogFiltersDto) {
    return this.audit.findAll(filters);
  }
}
