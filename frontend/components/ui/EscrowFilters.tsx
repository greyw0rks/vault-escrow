'use client';
import { FilterBar } from './FilterBar';
import { SearchBar } from './SearchBar';
import type { EscrowState } from '@/lib/contract';

interface Props {
  query: string; onQuery: (q: string) => void;
  state: EscrowState | 'all'; onState: (s: EscrowState | 'all') => void;
  count: number;
}

export function EscrowFilters({ query, onQuery, state, onState, count }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
      <SearchBar value={query} onChange={onQuery} placeholder="Search escrows..." />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
        <FilterBar state={state} onChange={onState} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
          {count} result{count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
