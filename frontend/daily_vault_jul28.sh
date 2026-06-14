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

# ── EscrowListControls.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowListControls.tsx << 'FILEOF'
'use client';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { ViewToggle } from './ViewToggle';
import { ExportButton } from './ExportButton';
import type { EscrowState } from '@/lib/contract';
import type { ViewMode } from '@/hooks/useViewMode';
import type { Escrow } from '@/lib/contract';

interface Props {
  query: string; onQuery: (q: string) => void;
  filter: EscrowState | 'all'; onFilter: (f: EscrowState | 'all') => void;
  viewMode: ViewMode; onToggleView: () => void;
  escrows: Escrow[];
}

export function EscrowListControls({ query, onQuery, filter, onFilter, viewMode, onToggleView, escrows }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={query} onChange={onQuery} />
        </div>
        <ViewToggle mode={viewMode} onToggle={onToggleView} />
        <ExportButton escrows={escrows} />
      </div>
      <FilterBar state={filter} onChange={onFilter} />
    </div>
  );
}
FILEOF
commit "components/ui/EscrowListControls.tsx" "Add EscrowListControls: combined search filter sort and view controls"

# ── useDashboardState.ts ──
mkdir -p hooks
cat > hooks/useDashboardState.ts << 'FILEOF'
'use client';
import { useState } from 'react';
import { useEscrowList } from './useEscrowList';
import { useEscrowFilter } from './useEscrowFilter';
import { useEscrowSearch } from './useEscrowSearch';
import { useViewMode } from './useViewMode';
import { useWallet } from './useWallet';
import type { EscrowState } from '@/lib/contract';

export function useDashboardState() {
  const { connected, address } = useWallet();
  const { escrows, loading, refetch } = useEscrowList();
  const [filter, setFilter] = useState<EscrowState | 'all'>('all');
  const [tab, setTab] = useState<'mine' | 'all'>('mine');
  const { mode, toggleMode } = useViewMode();

  const tabFiltered = tab === 'mine' && address
    ? escrows.filter(e => e.client === address || e.worker === address || e.resolver === address)
    : escrows;

  const stateFiltered = useEscrowFilter(tabFiltered, { state: filter });
  const { query, setQuery, results } = useEscrowSearch(stateFiltered);

  return { connected, address, loading, refetch, filter, setFilter, tab, setTab, mode, toggleMode, query, setQuery, escrows, results };
}
FILEOF
commit "hooks/useDashboardState.ts" "Add useDashboardState: combined state for dashboard page"

# ── noop.ts ──
mkdir -p lib
cat > lib/noop.ts << 'FILEOF'
export function noop(): void {}
export function noopAsync(): Promise<void> { return Promise.resolve(); }
export function identity<T>(v: T): T { return v; }
export function always<T>(v: T): () => T { return () => v; }
export function not(fn: () => boolean): () => boolean { return () => !fn(); }
FILEOF
commit "lib/noop.ts" "Add noop: no-op function and type helpers for optional callbacks"

echo ""
echo "🎯 July 28 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
