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

# ── ChainInfo.tsx ──
mkdir -p components/ui
cat > components/ui/ChainInfo.tsx << 'FILEOF'
'use client';
import { NetworkBadge } from './NetworkBadge';
import { BlockHeightBadge } from './BlockHeightBadge';
import { STXPriceTicker } from './STXPriceTicker';

export function ChainInfo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <NetworkBadge />
      <BlockHeightBadge />
      <STXPriceTicker />
    </div>
  );
}
FILEOF
commit "components/ui/ChainInfo.tsx" "Add ChainInfo: display current chain network and block height"

# ── useEscrowDispute.ts ──
mkdir -p hooks
cat > hooks/useEscrowDispute.ts << 'FILEOF'
'use client';
import { useContractCall } from './useContractCall';
import { buildRaiseDispute, buildResolveDispute } from '@/lib/contract';

export function useEscrowDispute(escrowId: number, milestoneIndex: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();

  const raise = () => call(buildRaiseDispute(escrowId, milestoneIndex), onSuccess);
  const resolve = (toWorker: boolean) => call(buildResolveDispute(escrowId, milestoneIndex, toWorker), onSuccess);

  return { raise, resolve, loading, error, txId };
}
FILEOF
commit "hooks/useEscrowDispute.ts" "Add useEscrowDispute: manage dispute raise and resolve flow"

# ── bigint.ts ──
mkdir -p lib
cat > lib/bigint.ts << 'FILEOF'
export function bigMin(a: bigint, b: bigint): bigint { return a < b ? a : b; }
export function bigMax(a: bigint, b: bigint): bigint { return a > b ? a : b; }
export function bigAbs(a: bigint): bigint { return a < 0n ? -a : a; }

export function bigPct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((part * 10000n) / total) / 100;
}

export function safeSub(a: bigint, b: bigint): bigint {
  return a >= b ? a - b : 0n;
}
FILEOF
commit "lib/bigint.ts" "Add bigint: BigInt arithmetic helpers for STX amounts"

echo ""
echo "🎯 June 23 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
