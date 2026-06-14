#!/usr/bin/env bash
set -e
cd ~/Vaultstx/frontend

COUNT=0
commit() {
  git add "$1"
  git commit -q -m "$2"
  COUNT=$((COUNT+1))
  echo "✅ $2"
}

# ── DataTable.tsx ──
mkdir -p components/ui
cat > components/ui/DataTable.tsx << 'FILEOF'
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
FILEOF
commit "components/ui/DataTable.tsx" "Add DataTable: generic sortable data table component"

# ── useResizeObserver.ts ──
mkdir -p hooks
cat > hooks/useResizeObserver.ts << 'FILEOF'
'use client';
import { useEffect, useRef, useState } from 'react';

interface Size { width: number; height: number; }

export function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
FILEOF
commit "hooks/useResizeObserver.ts" "Add useResizeObserver: observe element size changes"

# ── diff-milestones.ts ──
mkdir -p lib
cat > lib/diff-milestones.ts << 'FILEOF'
import type { Milestone } from './contract';

export interface MilestoneDiff {
  index: number;
  from: Milestone['state'];
  to: Milestone['state'];
}

export function diffMilestones(prev: Milestone[], next: Milestone[]): MilestoneDiff[] {
  const diffs: MilestoneDiff[] = [];
  const len = Math.min(prev.length, next.length);
  for (let i = 0; i < len; i++) {
    if (prev[i].state !== next[i].state) {
      diffs.push({ index: i, from: prev[i].state, to: next[i].state });
    }
  }
  return diffs;
}
FILEOF
commit "lib/diff-milestones.ts" "Add diff-milestones: detect milestone state changes between polls"

echo ""
echo "🎯 July 5 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
