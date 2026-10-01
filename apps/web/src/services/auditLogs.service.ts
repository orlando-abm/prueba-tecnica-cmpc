import { http } from '@/lib/http';
import { toQuery } from '@/lib/query';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';
import type { AuditLog } from '@repo/shared/types/audit-log.types';
import type { AuditLogFiltersDto } from '@repo/shared/schemas/audit-log.schema';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const auditLogsService = {
  findAll: (filters: Partial<AuditLogFiltersDto> = {}) =>
    http.get<PaginatedResponse<AuditLog>>(`${ENDPOINTS.auditLogs.findAll}${toQuery(filters)}`),
};
