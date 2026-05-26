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
