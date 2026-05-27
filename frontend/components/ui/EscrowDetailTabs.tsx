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
