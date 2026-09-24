import { cn } from '@/lib/cn';
import type { EscrowState, MilestoneState, DisputeState } from '@/lib/contract';

const pill =
  'inline-flex items-center border-2 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest';

const ESCROW_STYLES: Record<EscrowState, string> = {
  open: 'border-line bg-panel-2 text-fg-2',
  active: 'border-fg bg-fg text-bg',
  disputed: 'border-hazard bg-hazard text-fg',
  complete: 'border-line bg-transparent text-fg',
  cancelled: 'hatch border-line text-dim',
};

const ESCROW_LABEL: Record<EscrowState, string> = {
  open: '○ OPEN',
  active: '● ACTIVE',
  disputed: '! DISPUTED',
  complete: '✓ COMPLETE',
  cancelled: '✕ CANCELLED',
};

export function EscrowBadge({ state, className }: { state: EscrowState; className?: string }) {
  return <span className={cn(pill, ESCROW_STYLES[state], className)}>{ESCROW_LABEL[state]}</span>;
}

const MS_STYLES: Record<MilestoneState, string> = {
  pending: 'border-line bg-panel-2 text-dim',
  submitted: 'border-fg bg-transparent text-fg',
  approved: 'border-line bg-transparent text-fg',
  disputed: 'border-hazard bg-hazard text-fg',
};

const MS_LABEL: Record<MilestoneState, string> = {
  pending: 'PENDING',
  submitted: '▲ SUBMITTED',
  approved: '✓ APPROVED',
  disputed: '! DISPUTED',
};

export function MilestoneBadge({ state, className }: { state: MilestoneState; className?: string }) {
  return <span className={cn(pill, MS_STYLES[state], className)}>{MS_LABEL[state]}</span>;
}

const DISPUTE_STYLES: Record<DisputeState, string> = {
  open: 'border-hazard bg-transparent text-hazard',
  resolved: 'border-fg bg-transparent text-fg',
  withdrawn: 'border-line bg-panel-2 text-dim',
};

const DISPUTE_LABEL: Record<DisputeState, string> = {
  open: '! OPEN',
  resolved: '✓ RESOLVED',
  withdrawn: '– WITHDRAWN',
};

export function DisputeBadge({ state, className }: { state: DisputeState; className?: string }) {
  return <span className={cn(pill, DISPUTE_STYLES[state], className)}>{DISPUTE_LABEL[state]}</span>;
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-line bg-panel-2 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-fg-2',
        className,
      )}
    >
      {children}
    </span>
  );
}
