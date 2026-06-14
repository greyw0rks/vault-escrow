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

# -- EscrowFilters.tsx --
mkdir -p components/ui
cat > components/ui/EscrowFilters.tsx << 'FILEOF'
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
FILEOF
commit "components/ui/EscrowFilters.tsx" "Add EscrowFilters: full-featured escrow list filter panel"

# -- useEscrowFilters.ts --
mkdir -p hooks
cat > hooks/useEscrowFilters.ts << 'FILEOF'
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
FILEOF
commit "hooks/useEscrowFilters.ts" "Add useEscrowFilters: combined filter and search state for escrow list"

# -- filters.ts --
mkdir -p lib
cat > lib/filters.ts << 'FILEOF'
import type { Escrow, EscrowState } from './contract';

export function filterByState(escrows: Escrow[], state: EscrowState | 'all'): Escrow[] {
  if (state === 'all') return escrows;
  return escrows.filter(e => e.state === state);
}

export function filterByAddress(escrows: Escrow[], address: string): Escrow[] {
  return escrows.filter(e => e.client === address || e.worker === address || e.resolver === address);
}

export function filterByQuery(escrows: Escrow[], query: string): Escrow[] {
  if (!query.trim()) return escrows;
  const q = query.toLowerCase();
  return escrows.filter(e =>
    String(e.id).includes(q) ||
    e.client.toLowerCase().includes(q) ||
    e.worker.toLowerCase().includes(q)
  );
}
FILEOF
commit "lib/filters.ts" "Add filters: pure filter functions for escrow collections"

echo ""
echo "🎯 August 3 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
