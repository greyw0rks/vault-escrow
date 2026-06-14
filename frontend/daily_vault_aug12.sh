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

# -- EscrowDetailTabs.tsx --
mkdir -p components/ui
cat > components/ui/EscrowDetailTabs.tsx << 'FILEOF'
'use client';
import { useState } from 'react';
import { TabBar } from './TabBar';
import { MilestoneList } from './MilestoneList';
import { EscrowTimeline } from './EscrowTimeline';
import { ActivityFeed } from './ActivityFeed';
import { AuditLog } from './AuditLog';
import { useEscrowTimeline } from '@/hooks/useEscrowTimeline';
import { useEscrowActivity } from '@/hooks/useEscrowActivity';
import { useAuditLog } from '@/hooks/useAuditLog';
import type { Escrow, Milestone } from '@/lib/contract';

type Tab = 'milestones' | 'timeline' | 'activity' | 'audit';
const TABS = [
  { id: 'milestones' as Tab, label: 'Milestones' },
  { id: 'timeline'   as Tab, label: 'Timeline' },
  { id: 'activity'   as Tab, label: 'Activity' },
  { id: 'audit'      as Tab, label: 'Audit' },
];

interface Props {
  escrow: Escrow; milestones: Milestone[];
  isClient: boolean; isWorker: boolean; isResolver: boolean; txLoading: boolean;
  onSubmit: (i: number) => void; onApprove: (i: number) => void;
  onDispute: (i: number) => void; onResolve: (i: number, tw: boolean) => void;
}

export function EscrowDetailTabs(props: Props) {
  const [tab, setTab] = useState<Tab>('milestones');
  const timelineEvents = useEscrowTimeline(props.escrow, props.milestones);
  const activityItems  = useEscrowActivity(props.escrow, props.milestones);
  const auditEntries   = useAuditLog(props.escrow, props.milestones);

  return (
    <div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: '1.25rem' }}>
        {tab === 'milestones' && <MilestoneList escrow={props.escrow} milestones={props.milestones} isClient={props.isClient} isWorker={props.isWorker} isResolver={props.isResolver} txLoading={props.txLoading} onSubmit={props.onSubmit} onApprove={props.onApprove} onDispute={props.onDispute} onResolve={props.onResolve} />}
        {tab === 'timeline'   && <EscrowTimeline events={timelineEvents} />}
        {tab === 'activity'   && <ActivityFeed items={activityItems} />}
        {tab === 'audit'      && <AuditLog events={auditEntries} />}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/EscrowDetailTabs.tsx" "Add EscrowDetailTabs: tabbed sections for escrow detail page"

# -- useEscrowDetailPage.ts --
mkdir -p hooks
cat > hooks/useEscrowDetailPage.ts << 'FILEOF'
'use client';
import { useEscrowById } from './useEscrowById';
import { useWallet } from './useWallet';
import { useEscrowRole } from './useEscrowRole';
import { useEscrowActions } from './useEscrowActions';
import { useMilestoneProgress } from './useMilestoneProgress';
import { useEscrowHistory } from './useEscrowHistory';

export function useEscrowDetailPage() {
  const { connected, address } = useWallet();
  const { escrow, milestones, loading, error, refetch, escrowId } = useEscrowById();
  const role     = useEscrowRole(escrow, address);
  const actions  = useEscrowActions(escrow?.id ?? 0, escrow?.activeMilestone ?? 0, refetch);
  const progress = useMilestoneProgress(milestones);
  useEscrowHistory(escrowId);

  return {
    connected, address, escrow, milestones, loading, error, refetch,
    role, actions, progress,
    isClient:   role === 'client',
    isWorker:   role === 'worker',
    isResolver: role === 'resolver',
  };
}
FILEOF
commit "hooks/useEscrowDetailPage.ts" "Add useEscrowDetailPage: complete state for escrow detail page"

# -- layout.ts --
mkdir -p lib
cat > lib/layout.ts << 'FILEOF'
export const BREAKPOINTS = {
  sm: 640, md: 768, lg: 1024, xl: 1280,
} as const;

export const MAX_WIDTH    = 900;
export const NAV_HEIGHT   = 64;
export const SIDEBAR_WIDTH = 280;

export function isMobileWidth(w: number): boolean   { return w < BREAKPOINTS.sm; }
export function isTabletWidth(w: number): boolean   { return w >= BREAKPOINTS.sm && w < BREAKPOINTS.lg; }
export function isDesktopWidth(w: number): boolean  { return w >= BREAKPOINTS.lg; }
FILEOF
commit "lib/layout.ts" "Add layout: layout constants and responsive breakpoint helpers"

echo ""
echo "🎯 August 12 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
