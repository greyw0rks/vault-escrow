import { useState, useMemo } from 'react';
import type { Escrow } from '@/lib/contract';

type SortField = 'id' | 'totalAmount' | 'createdAt' | 'milestoneCount';
type Direction = 'asc' | 'desc';

export function useSortable(escrows: Escrow[], defaultField: SortField = 'id', defaultDir: Direction = 'desc') {
  const [field, setField] = useState<SortField>(defaultField);
  const [dir, setDir] = useState<Direction>(defaultDir);

  const toggle = (f: SortField) => {
    if (f === field) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setField(f); setDir('desc'); }
  };

  const sorted = useMemo(() => [...escrows].sort((a, b) => {
    const av = Number(a[field]); const bv = Number(b[field]);
    return dir === 'asc' ? av - bv : bv - av;
  }), [escrows, field, dir]);

  return { sorted, field, dir, toggle };
}
