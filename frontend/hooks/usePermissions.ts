import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';
import type { Role } from '@/lib/types';
import { canSubmit, canApprove, canDispute, canResolve } from '@/lib/permissions';

export function usePermissions(role: Role, escrow: Escrow | null, milestone: Milestone | null) {
  return useMemo(() => {
    if (!escrow || !milestone) return { submit: false, approve: false, dispute: false, resolve: false };
    return {
      submit:  canSubmit(role, milestone, escrow),
      approve: canApprove(role, milestone, escrow),
      dispute: canDispute(role, milestone, escrow),
      resolve: canResolve(role, milestone, escrow),
    };
  }, [role, escrow, milestone]);
}
