'use client';
import { useMemo } from 'react';
import { useEscrowTimeline } from './useEscrowTimeline';
import type { Escrow, Milestone } from '@/lib/contract';

export function useAuditLog(escrow: Escrow | null, milestones: Milestone[]) {
  const events = useEscrowTimeline(escrow, milestones);
  return useMemo(() => events.map(ev => ({
    ...ev,
    timestamp: 'Block #' + ev.block.toLocaleString(),
  })), [events]);
}
