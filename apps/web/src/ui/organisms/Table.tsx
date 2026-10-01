interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyField,
  emptyMessage = 'Sin resultados.',
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr className="border-b border-border-light">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
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
                className="border-b border-border-light last:border-0 hover:bg-black/[0.02] transition-colors"
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
