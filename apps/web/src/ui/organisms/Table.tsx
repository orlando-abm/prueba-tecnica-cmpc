import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
  sortKey?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyField,
  emptyMessage = 'Sin resultados.',
  sortBy,
  order,
  onSort,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr className="border-b border-border-light">
            {columns.map((col) => {
              const isSortable = !!col.sortKey && !!onSort;
              const isActive = col.sortKey && col.sortKey === sortBy;

              return (
                <th
                  key={String(col.key)}
                  className={`py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary ${col.className ?? ''} ${isSortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''}`}
                  onClick={isSortable ? () => onSort!(col.sortKey!) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {isSortable && (
                      <span className={isActive ? 'text-accent' : 'text-border-light'}>
                        {isActive && order === 'asc' ? (
                          <ChevronUp size={13} />
                        ) : isActive && order === 'desc' ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronsUpDown size={13} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border-light last:border-0 hover:bg-black/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`py-3.5 px-4 text-text-primary ${col.className ?? ''}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
