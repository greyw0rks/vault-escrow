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

# ── EscrowActionsPanel.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowActionsPanel.tsx << 'FILEOF'
'use client';
import { useEscrowActions } from '@/hooks/useEscrowActions';
import { usePermissions } from '@/hooks/usePermissions';
import { useEscrowRole } from '@/hooks/useEscrowRole';
import { microToSTX } from '@/lib/contract';
import type { Escrow, Milestone } from '@/lib/contract';

interface Props {
  escrow: Escrow;
  milestone: Milestone;
  milestoneIndex: number;
  myAddress: string | null;
  onSuccess: () => void;
}

export function EscrowActionsPanel({ escrow, milestone, milestoneIndex, myAddress, onSuccess }: Props) {
  const role = useEscrowRole(escrow, myAddress);
  const perms = usePermissions(role, escrow, milestone);
  const actions = useEscrowActions(escrow.id, milestoneIndex, onSuccess);

  if (!perms.submit && !perms.approve && !perms.dispute && !perms.resolve) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', padding: '1rem', background: 'var(--raised)', borderRadius: 'var(--radius)', marginTop: '.75rem' }}>
      {perms.submit && (
        <button className="btn-primary btn-sm" onClick={() => actions.submitMilestone(milestoneIndex)} disabled={actions.loading}>
          Submit for review
        </button>
      )}
      {perms.approve && (
        <button className="btn-success btn-sm" onClick={() => actions.approveMilestone(milestoneIndex)} disabled={actions.loading}>
          Approve & release {microToSTX(milestone.amount)} STX
        </button>
      )}
      {perms.dispute && (
        <button className="btn-danger btn-sm" onClick={() => actions.raiseDispute()} disabled={actions.loading}>
          Raise dispute
        </button>
      )}
      {perms.resolve && (
        <>
          <button className="btn-success btn-sm" onClick={() => actions.resolveDispute(true)} disabled={actions.loading}>Release to worker</button>
          <button className="btn-warning btn-sm" onClick={() => actions.resolveDispute(false)} disabled={actions.loading}>Refund client</button>
        </>
      )}
      {actions.error && <p style={{ color: '#A32D2D', fontSize: '.8125rem', margin: 0, width: '100%' }}>{actions.error}</p>}
    </div>
  );
}
FILEOF
commit "components/ui/EscrowActionsPanel.tsx" "Add EscrowActionsPanel: full action panel using unified actions hook"

# ── useEscrowSummary.ts ──
mkdir -p hooks
cat > hooks/useEscrowSummary.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';
import { escrowProgress } from '@/lib/math';

export function useEscrowSummary(escrows: Escrow[], address: string | null) {
  return useMemo(() => {
    const myEscrows = escrows.filter(e => e.client === address || e.worker === address);
    const asClient  = myEscrows.filter(e => e.client === address);
    const asWorker  = myEscrows.filter(e => e.worker === address);
    const totalLocked = escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n);
    const avgProgress = escrows.length > 0
      ? Math.round(escrows.reduce((a, e) => a + escrowProgress(e.released, e.totalAmount), 0) / escrows.length)
      : 0;
    return { myEscrows, asClient, asWorker, totalLocked, lockedSTX: microToSTX(totalLocked), avgProgress };
  }, [escrows, address]);
}
FILEOF
commit "hooks/useEscrowSummary.ts" "Add useEscrowSummary: derive display-ready summary from escrow"

# ── text.ts ──
mkdir -p lib
cat > lib/text.ts << 'FILEOF'
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function charCount(str: string): number {
  return str.length;
}

export function truncateMiddle(str: string, maxLen = 24): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor(maxLen / 2);
  return str.slice(0, half) + '\u2026' + str.slice(-half);
}
FILEOF
commit "lib/text.ts" "Add text: text processing helpers for escrow descriptions"

echo ""
echo "🎯 July 13 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
