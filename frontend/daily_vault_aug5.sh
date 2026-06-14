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

# -- MilestoneStatusDots.tsx --
mkdir -p components/ui
cat > components/ui/MilestoneStatusDots.tsx << 'FILEOF'
import type { Milestone } from '@/lib/contract';

const COLORS: Record<string, string> = {
  pending: 'var(--border)', submitted: '#EF9F27', approved: '#1D9E75', disputed: '#A32D2D',
};

export function MilestoneStatusDots({ milestones }: { milestones: Milestone[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {milestones.map((ms, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[ms.state] ?? 'var(--border)', flexShrink: 0 }} title={ms.state} />
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/MilestoneStatusDots.tsx" "Add MilestoneStatusDots: row of colored dots for milestone states"

# -- useMilestoneActions.ts --
mkdir -p hooks
cat > hooks/useMilestoneActions.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';
import type { Role } from '@/lib/types';

export function useMilestoneActions(role: Role, escrow: Escrow | null, milestone: Milestone | null) {
  return useMemo(() => ({
    canSubmit:  role === 'worker'   && milestone?.state === 'pending'   && escrow?.state === 'active',
    canApprove: role === 'client'   && milestone?.state === 'submitted' && escrow?.state === 'active',
    canDispute: (role === 'client' || role === 'worker') && milestone?.state === 'submitted' && escrow?.state === 'active',
    canResolve: role === 'resolver' && milestone?.state === 'disputed'  && escrow?.state === 'disputed',
  }), [role, escrow, milestone]);
}
FILEOF
commit "hooks/useMilestoneActions.ts" "Add useMilestoneActions: derive available actions for a milestone"

# -- milestone-utils.ts --
mkdir -p lib
cat > lib/milestone-utils.ts << 'FILEOF'
import type { Milestone, MilestoneState } from './contract';

export function isActionable(ms: Milestone): boolean {
  return ms.state === 'pending' || ms.state === 'submitted' || ms.state === 'disputed';
}

export function isTerminal(ms: Milestone): boolean {
  return ms.state === 'approved';
}

export function nextExpectedState(ms: Milestone): MilestoneState | null {
  if (ms.state === 'pending')   return 'submitted';
  if (ms.state === 'submitted') return 'approved';
  if (ms.state === 'disputed')  return 'approved';
  return null;
}

export function milestoneLabel(ms: Milestone, index: number): string {
  return 'Milestone ' + (index + 1) + ': ' + ms.description.slice(0, 40);
}
FILEOF
commit "lib/milestone-utils.ts" "Add milestone-utils: helper functions for milestone state logic"

echo ""
echo "🎯 August 5 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
