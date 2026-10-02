import { useState } from 'react';
import { X } from 'lucide-react';
import type { AuditLog, AuditAction } from '@repo/shared/types/audit-log.types';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Select } from '@/ui/atoms';
import { Table, Pagination } from '@/ui/organisms';
import { Badge } from '@/ui/atoms';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

const ACTION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'Todas las entidades' },
  { value: 'Book', label: 'Libro' },
  { value: 'Author', label: 'Autor' },
  { value: 'Publisher', label: 'Editorial' },
  { value: 'Genre', label: 'Género' },
];

const ACTION_BADGE: Record<AuditAction, { variant: 'success' | 'info' | 'error'; label: string }> =
  {
    CREATE: { variant: 'success', label: 'Crear' },
    UPDATE: { variant: 'info', label: 'Actualizar' },
    DELETE: { variant: 'error', label: 'Eliminar' },
  };

const ENTITY_LABEL: Record<string, string> = {
  Book: 'Libro',
  Author: 'Autor',
  Publisher: 'Editorial',
  Genre: 'Género',
};

const COLUMNS: Column<AuditLog>[] = [
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (row) =>
      new Date(row.createdAt).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  {
    key: 'action',
    header: 'Acción',
    render: (row) => {
      const { variant, label } = ACTION_BADGE[row.action];
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    key: 'entity',
    header: 'Entidad',
    render: (row) => (
      <span className="font-sans text-sm text-text-primary">
        {ENTITY_LABEL[row.entity] ?? row.entity}
      </span>
    ),
  },
  {
    key: 'entityId',
    header: 'ID entidad',
    render: (row) => (
      <span className="font-mono text-xs text-text-secondary" title={row.entityId}>
        {row.entityId.slice(0, 8)}…
      </span>
    ),
  },
  {
    key: 'metadata',
    header: 'Detalle',
    render: (row) => {
      const entries = Object.entries(row.metadata ?? {}).filter(([k]) => k !== 'restored');
      if (row.metadata?.restored) return <span className="font-sans text-xs text-text-secondary">Restaurado</span>;
      if (entries.length === 0) return <span className="text-text-secondary">—</span>;
      return (
        <span className="font-sans text-xs text-text-secondary truncate max-w-[200px] block">
          {entries.map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </span>
      );
    },
  },
  {
    key: 'user',
    header: 'Usuario',
    render: (row) => (
      <span className="font-sans text-xs text-text-secondary">{row.user.email}</span>
    ),
  },
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    ...(action ? { action: action as AuditAction } : {}),
    ...(entity ? { entity: entity as 'Book' | 'Author' | 'Publisher' | 'Genre' } : {}),
  });

  const hasFilters = action !== '' || entity !== '';

  function clearFilters() {
    setAction('');
    setEntity('');
    setPage(1);
  }

  return (
    <div className="p-6 sm:p-10 flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-text-primary">Auditoría</h1>
        <p className="font-sans text-sm text-text-secondary mt-1">
          {data ? `${data.total} registros` : ' '}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-48">
            <Select
              value={action}
              options={ACTION_OPTIONS}
              onChange={(val) => { setAction(val); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={entity}
              options={ENTITY_OPTIONS}
              onChange={(val) => { setEntity(val); setPage(1); }}
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-sans text-text-secondary hover:text-text-primary underline cursor-pointer transition-colors"
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>

        <div className="bg-surface-light rounded-xl border border-border-light overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-text-secondary font-sans text-sm">
              Cargando...
            </div>
          ) : (
            <Table
              columns={COLUMNS}
              data={data?.items ?? []}
              keyField="id"
              emptyMessage="No hay registros de auditoría."
            />
          )}
        </div>

        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            itemLabel="registros"
          />
        )}
      </div>
    </div>
  );
}
