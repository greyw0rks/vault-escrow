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

# ── MilestoneAmountSplit.tsx ──
mkdir -p components/ui
cat > components/ui/MilestoneAmountSplit.tsx << 'FILEOF'
'use client';
import { splitEqually } from '@/lib/math';
import { microToSTX, stxToMicro } from '@/lib/contract';

interface Props {
  deposit: string;
  count: number;
  onApply: (amounts: string[]) => void;
}

export function MilestoneAmountSplit({ deposit, count, onApply }: Props) {
  if (!deposit || count === 0) return null;
  const micro = stxToMicro(deposit);
  const splits = splitEqually(micro, count).map(a => microToSTX(a));

  return (
    <button
      type="button"
      className="btn-ghost"
      style={{ fontSize: '.8125rem', padding: '.35rem .75rem' }}
      onClick={() => onApply(splits)}
    >
      ÷ Split equally ({microToSTX(micro / BigInt(count))} STX each)
    </button>
  );
}
FILEOF
commit "components/ui/MilestoneAmountSplit.tsx" "Add MilestoneAmountSplit: auto-split deposit across milestones UI"

# ── useEscrowSubmit.ts ──
mkdir -p hooks
cat > hooks/useEscrowSubmit.ts << 'FILEOF'
'use client';
import { useContractCall } from './useContractCall';
import { buildSubmitMilestone } from '@/lib/contract';

export function useEscrowSubmit(escrowId: number, onSuccess?: () => void) {
  const { call, loading, error, txId } = useContractCall();
  const submit = (milestoneIndex: number) =>
    call(buildSubmitMilestone(escrowId, milestoneIndex), onSuccess);
  return { submit, loading, error, txId };
}
FILEOF
commit "hooks/useEscrowSubmit.ts" "Add useEscrowSubmit: milestone submission contract call hook"

# ── format-address.ts ──
mkdir -p lib
cat > lib/format-address.ts << 'FILEOF'
export function formatFull(address: string): string {
  return address;
}

export function formatShort(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 3) return address;
  return address.slice(0, head) + '\u2026' + address.slice(-tail);
}

export function formatMedium(address: string): string {
  return formatShort(address, 10, 6);
}

export function addressesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
FILEOF
commit "lib/format-address.ts" "Add format-address: multi-format address display helpers"

echo ""
echo "🎯 June 25 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
