import { z } from 'zod';
import { PaginationSchema } from './pagination.schema.js';

export const AuditActionSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);

export const AuditLogFiltersSchema = PaginationSchema.extend({
  entity: z.enum(['Book', 'Author', 'Publisher', 'Genre']).optional(),
  action: AuditActionSchema.optional(),
});

export type AuditLogFiltersDto = z.infer<typeof AuditLogFiltersSchema>;
