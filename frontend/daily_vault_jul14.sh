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

# ── SummaryPanel.tsx ──
mkdir -p components/ui
cat > components/ui/SummaryPanel.tsx << 'FILEOF'
'use client';
import { useEscrowSummary } from '@/hooks/useEscrowSummary';
import { StatCard } from './StatCard';
import { USDValue } from './USDValue';
import type { Escrow } from '@/lib/contract';

interface Props { escrows: Escrow[]; address: string | null; }

export function SummaryPanel({ escrows, address }: Props) {
  const { asClient, asWorker, totalLocked, lockedSTX, avgProgress } = useEscrowSummary(escrows, address);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.75rem', marginBottom: '1.75rem' }}>
      <StatCard label="As Client"  value={asClient.length} />
      <StatCard label="As Worker"  value={asWorker.length} color="#1D9E75" />
      <StatCard label="Locked STX" value={lockedSTX} sub={<USDValue micro={totalLocked} />} />
      <StatCard label="Avg Progress" value={avgProgress + '%'} color="#7C6AF7" />
    </div>
  );
}
FILEOF
commit "components/ui/SummaryPanel.tsx" "Add SummaryPanel: dashboard summary with STX totals"

# ── useAutoSave.ts ──
mkdir -p hooks
cat > hooks/useAutoSave.ts << 'FILEOF'
'use client';
import { useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useAutoSave<T>(data: T, save: (d: T) => void, delay = 1000) {
  const debounced = useDebounce(data, delay);
  useEffect(() => { save(debounced); }, [debounced]);
}
FILEOF
commit "hooks/useAutoSave.ts" "Add useAutoSave: auto-save form state on change with debounce"

# ── contract-utils.ts ──
mkdir -p lib
cat > lib/contract-utils.ts << 'FILEOF'
import { fetchEscrow, fetchAllMilestones, type Escrow, type Milestone } from './contract';
import { batchAsync } from './batch';
import { withRetry } from './retry';

export async function fetchEscrowWithMilestones(id: number): Promise<{ escrow: Escrow; milestones: Milestone[] } | null> {
  const escrow = await withRetry(() => fetchEscrow(id));
  if (!escrow) return null;
  const milestones = await withRetry(() => fetchAllMilestones(escrow));
  return { escrow, milestones };
}

export async function fetchMultipleEscrows(ids: number[]): Promise<(Escrow | null)[]> {
  return batchAsync(ids, id => fetchEscrow(id), 5);
}

export async function scanEscrows(maxId: number): Promise<Escrow[]> {
  const ids = Array.from({ length: maxId }, (_, i) => i + 1);
  const results = await fetchMultipleEscrows(ids);
  return results.filter(Boolean) as Escrow[];
}
FILEOF
commit "lib/contract-utils.ts" "Add contract-utils: higher-level contract interaction utilities"

echo ""
echo "🎯 July 14 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
