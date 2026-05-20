'use client';
import { MilestoneCard } from './MilestoneCard';
import { ActionPanel } from './ActionPanel';
import type { Escrow, Milestone } from '@/lib/contract';

interface Props {
  escrow: Escrow;
  milestones: Milestone[];
  isClient: boolean;
  isWorker: boolean;
  isResolver: boolean;
  txLoading: boolean;
  onSubmit: (i: number) => void;
  onApprove: (i: number) => void;
  onDispute: (i: number) => void;
  onResolve: (i: number, toWorker: boolean) => void;
}

export function MilestoneList({ escrow, milestones, isClient, isWorker, isResolver, txLoading, onSubmit, onApprove, onDispute, onResolve }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {milestones.map((ms, i) => (
        <div key={i}>
          <MilestoneCard milestone={ms} index={i} active={i === escrow.activeMilestone} />
          {i === escrow.activeMilestone && (
            <ActionPanel
              escrow={escrow} milestone={ms} index={i}
              isClient={isClient} isWorker={isWorker} isResolver={isResolver}
              loading={txLoading}
              onSubmit={() => onSubmit(i)}
              onApprove={() => onApprove(i)}
              onDispute={() => onDispute(i)}
              onResolve={(tw) => onResolve(i, tw)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
