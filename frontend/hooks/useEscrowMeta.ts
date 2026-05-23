import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';

export function useEscrowMeta(escrow: Escrow | null) {
  return useMemo(() => {
    if (!escrow) return null;
    const releasedPct = escrow.totalAmount > 0n
      ? Math.round(Number(escrow.released) / Number(escrow.totalAmount) * 100)
      : 0;
    const remaining = escrow.totalAmount - escrow.released;
    const isComplete  = escrow.state === 'complete';
    const isDisputed  = escrow.state === 'disputed';
    const isActive    = escrow.state === 'active';
    return {
      releasedPct,
      remaining,
      remainingSTX: microToSTX(remaining),
      totalSTX:     microToSTX(escrow.totalAmount),
      releasedSTX:  microToSTX(escrow.released),
      isComplete, isDisputed, isActive,
    };
  }, [escrow]);
}
