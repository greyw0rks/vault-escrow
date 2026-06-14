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

# -- MilestoneProgress.tsx --
mkdir -p components/ui
cat > components/ui/MilestoneProgress.tsx << 'FILEOF'
import type { Escrow } from '@/lib/contract';

export function MilestoneProgress({ escrow, approved }: { escrow: Escrow; approved: number }) {
  const pct = escrow.milestoneCount > 0
    ? Math.round((approved / escrow.milestoneCount) * 100) : 0;
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
      {approved}/{escrow.milestoneCount} milestones · {pct}%
    </span>
  );
}
FILEOF
commit "components/ui/MilestoneProgress.tsx" "Add MilestoneProgress: compact inline milestone progress text"

# -- useMilestoneProgress.ts --
mkdir -p hooks
cat > hooks/useMilestoneProgress.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Milestone } from '@/lib/contract';

export function useMilestoneProgress(milestones: Milestone[]) {
  return useMemo(() => {
    const total     = milestones.length;
    const approved  = milestones.filter(m => m.state === 'approved').length;
    const submitted = milestones.filter(m => m.state === 'submitted').length;
    const disputed  = milestones.filter(m => m.state === 'disputed').length;
    const pending   = milestones.filter(m => m.state === 'pending').length;
    const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, submitted, disputed, pending, pct };
  }, [milestones]);
}
FILEOF
commit "hooks/useMilestoneProgress.ts" "Add useMilestoneProgress: calculate milestone completion metrics"

# -- progress.ts --
mkdir -p lib
cat > lib/progress.ts << 'FILEOF'
export function calcProgress(released: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round(Number(released) * 100 / Number(total));
}

export function calcMilestoneProgress(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 100);
}

export function isComplete(released: bigint, total: bigint): boolean {
  return total > 0n && released >= total;
}
FILEOF
commit "lib/progress.ts" "Add progress: progress calculation utilities for escrow display"

echo ""
echo "🎯 August 2 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
