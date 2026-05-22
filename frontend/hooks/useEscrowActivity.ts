import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';

export interface ActivityItem {
  type: 'submitted' | 'approved' | 'disputed';
  milestoneIndex: number;
  description: string;
  block: number;
}

export function useEscrowActivity(escrow: Escrow | null, milestones: Milestone[]): ActivityItem[] {
  return useMemo(() => {
    if (!escrow) return [];
    const items: ActivityItem[] = [];
    milestones.forEach((ms, i) => {
      if (ms.blockSubmitted > 0) items.push({ type: 'submitted', milestoneIndex: i, description: ms.description, block: ms.blockSubmitted });
      if (ms.state === 'approved' && ms.blockResolved > 0) items.push({ type: 'approved', milestoneIndex: i, description: ms.description, block: ms.blockResolved });
      if (ms.state === 'disputed' && ms.blockResolved > 0) items.push({ type: 'disputed', milestoneIndex: i, description: ms.description, block: ms.blockResolved });
    });
    return items.sort((a, b) => b.block - a.block);
  }, [escrow, milestones]);
}
