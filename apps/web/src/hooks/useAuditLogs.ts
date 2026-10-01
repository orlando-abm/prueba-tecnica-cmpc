import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditLogsService } from '@/services/auditLogs.service';
import type { AuditLogFiltersDto } from '@repo/shared/schemas/audit-log.schema';

export const AUDIT_LOGS_KEY = 'audit-logs';

export function useAuditLogs(filters: Partial<AuditLogFiltersDto> = {}) {
  return useQuery({
    queryKey: [AUDIT_LOGS_KEY, filters],
    queryFn: () => auditLogsService.findAll(filters),
    placeholderData: keepPreviousData,
  });
}
