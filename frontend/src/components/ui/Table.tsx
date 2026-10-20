import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found in active sector.',
  className = '',
}: TableProps<T>) {
  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`w-full overflow-x-auto border border-border rounded bg-surface ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-deep-slate/70">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted ${alignClass(
                  col.align
                )} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors text-xs font-sans text-text-secondary ${
                  onRowClick ? 'hover:bg-deep-slate/60 cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-3 whitespace-nowrap ${alignClass(col.align)} ${
                      col.className || ''
                    }`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-xs font-mono text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
