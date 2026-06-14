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

# ── USDValue.tsx ──
mkdir -p components/ui
cat > components/ui/USDValue.tsx << 'FILEOF'
'use client';
import { useSTXPrice } from '@/hooks/useSTXPrice';
import { formatSTXUSD } from '@/lib/format-stx';

interface Props { micro: bigint; muted?: boolean; }

export function USDValue({ micro, muted = true }: Props) {
  const { price } = useSTXPrice();
  if (!price) return null;
  return (
    <span style={{ color: muted ? 'var(--muted)' : 'var(--text)', fontSize: '.75rem', fontFamily: "'JetBrains Mono',monospace" }}>
      ≈ {formatSTXUSD(micro, price)}
    </span>
  );
}
FILEOF
commit "components/ui/USDValue.tsx" "Add USDValue: display STX amount with USD equivalent"

# ── useEscrowActions.ts ──
mkdir -p hooks
cat > hooks/useEscrowActions.ts << 'FILEOF'
'use client';
import { useEscrowSubmit } from './useEscrowSubmit';
import { useEscrowApprove } from './useEscrowApprove';
import { useEscrowDispute } from './useEscrowDispute';

export function useEscrowActions(escrowId: number, milestoneIndex: number, onSuccess?: () => void) {
  const submit  = useEscrowSubmit(escrowId, onSuccess);
  const approve = useEscrowApprove(escrowId, onSuccess);
  const dispute = useEscrowDispute(escrowId, milestoneIndex, onSuccess);

  const loading = submit.loading || approve.loading || dispute.loading;
  const error   = submit.error || approve.error || dispute.error;
  const txId    = submit.txId || approve.txId || dispute.txId;

  return {
    submitMilestone: submit.submit,
    approveMilestone: approve.approve,
    raiseDispute: dispute.raise,
    resolveDispute: dispute.resolve,
    loading, error, txId,
  };
}
FILEOF
commit "hooks/useEscrowActions.ts" "Add useEscrowActions: unified hook for all escrow contract actions"

# ── batch.ts ──
mkdir -p lib
cat > lib/batch.ts << 'FILEOF'
export async function batchAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 5,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null);
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }
  let offset = 0;
  for (const chunk of chunks) {
    const settled = await Promise.allSettled(chunk.map((item, i) => fn(item, offset + i)));
    settled.forEach((r, i) => { if (r.status === 'fulfilled') results[offset + i] = r.value; });
    offset += chunk.length;
  }
  return results;
}
FILEOF
commit "lib/batch.ts" "Add batch: batch multiple async operations with concurrency control"

echo ""
echo "🎯 July 12 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
