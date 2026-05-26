'use client';
import { useState } from 'react';
import { useEscrowFilter } from './useEscrowFilter';
import { useEscrowSearch } from './useEscrowSearch';
import type { Escrow, EscrowState } from '@/lib/contract';

export function useEscrowFilters(escrows: Escrow[], address: string | null) {
  const [state, setState] = useState<EscrowState | 'all'>('all');
  const [tab, setTab]     = useState<'mine' | 'all'>('mine');

  const tabFiltered = tab === 'mine' && address
    ? escrows.filter(e => e.client === address || e.worker === address || e.resolver === address)
    : escrows;

  const stateFiltered = useEscrowFilter(tabFiltered, { state });
  const { query, setQuery, results } = useEscrowSearch(stateFiltered);

  return { results, query, setQuery, state, setState, tab, setTab, count: results.length };
}
