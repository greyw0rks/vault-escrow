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

# ── EscrowSummaryCard.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowSummaryCard.tsx << 'FILEOF'
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { ProgressRing } from './ProgressRing';
import { microToSTX } from '@/lib/contract';
import { bigPct } from '@/lib/bigint';
import type { Escrow } from '@/lib/contract';

export function EscrowSummaryCard({ escrow: e }: { escrow: Escrow }) {
  const pct = bigPct(e.released, e.totalAmount);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <ProgressRing pct={pct} size={48} label={pct + '%'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>#{e.id}</span>
          <EscrowStatusBadge state={e.state} />
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.125rem', color: 'var(--gold)' }}>
          {microToSTX(e.totalAmount)} STX
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.125rem' }}>
          {e.milestoneCount} milestones · {microToSTX(e.released)} released
        </div>
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/EscrowSummaryCard.tsx" "Add EscrowSummaryCard: compact summary for sidebar or preview"

# ── useEscrowApprove.ts ──
mkdir -p hooks
cat > hooks/useEscrowApprove.ts << 'FILEOF'
'use client';
import { useContractCall } from './useContractCall';
import { buildApproveMilestone } from '@/lib/contract';

export function useEscrowApprove(escrowId: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();
  const approve = (milestoneIndex: number) =>
    call(buildApproveMilestone(escrowId, milestoneIndex), onSuccess);
  return { approve, loading, error, txId };
}
FILEOF
commit "hooks/useEscrowApprove.ts" "Add useEscrowApprove: milestone approval contract call hook"

# ── math.ts ──
mkdir -p lib
cat > lib/math.ts << 'FILEOF'
export function escrowProgress(released: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round(Number(released) * 100 / Number(total));
}

export function splitEqually(total: bigint, parts: number): bigint[] {
  if (parts === 0) return [];
  const base = total / BigInt(parts);
  const remainder = total % BigInt(parts);
  return Array.from({ length: parts }, (_, i) => i === 0 ? base + remainder : base);
}

export function sumBigInt(values: bigint[]): bigint {
  return values.reduce((acc, v) => acc + v, 0n);
}
FILEOF
commit "lib/math.ts" "Add math: escrow financial math helpers"

echo ""
echo "🎯 June 24 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
