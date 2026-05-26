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
