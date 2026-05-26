import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';
import { useMilestoneActions } from './useMilestoneActions';
import type { Role } from '@/lib/types';

export function useQuickActions(
  role: Role,
  escrow: Escrow | null,
  milestone: Milestone | null,
  handlers: { submit: () => void; approve: () => void; dispute: () => void; resolveWorker: () => void; resolveClient: () => void },
) {
  const perms = useMilestoneActions(role, escrow, milestone);
  return useMemo(() => [
    { label: 'Submit for Review', icon: '📤', onClick: handlers.submit,        disabled: !perms.canSubmit },
    { label: 'Approve Milestone', icon: '✓',  onClick: handlers.approve,       disabled: !perms.canApprove },
    { label: 'Raise Dispute',     icon: '⚠',  onClick: handlers.dispute,       disabled: !perms.canDispute },
    { label: 'Release to Worker', icon: '→',  onClick: handlers.resolveWorker, disabled: !perms.canResolve },
    { label: 'Refund Client',     icon: '←',  onClick: handlers.resolveClient, disabled: !perms.canResolve },
  ], [perms, handlers]);
}
