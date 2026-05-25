'use client';
import { useState } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: keyof T;
}

export function DataTable<T extends Record<string, unknown>>({ columns, rows, keyField }: Props<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : rows;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={String(col.key)} onClick={col.sortable ? () => handleSort(col.key) : undefined}
                style={{ padding: '.625rem .75rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}>
                {col.label}{col.sortable && sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr key={String(row[keyField])} style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map(col => (
                <td key={String(col.key)} style={{ padding: '.625rem .75rem' }}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
