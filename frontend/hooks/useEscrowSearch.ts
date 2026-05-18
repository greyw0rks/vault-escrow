import { useState, useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import { useDebounce } from './useDebounce';

export function useEscrowSearch(escrows: Escrow[]) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);

  const results = useMemo(() => {
    if (!debounced.trim()) return escrows;
    const q = debounced.toLowerCase();
    return escrows.filter(e =>
      String(e.id).includes(q) ||
      e.client.toLowerCase().includes(q) ||
      e.worker.toLowerCase().includes(q)
    );
  }, [escrows, debounced]);

  return { query, setQuery, results };
}
