export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  userId: string;
  user: { email: string };
}
