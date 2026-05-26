import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';

export function useEscrowStatsAug(escrows: Escrow[]) {
  return useMemo(() => ({
    total:     escrows.length,
    open:      escrows.filter(e => e.state === 'open').length,
    active:    escrows.filter(e => e.state === 'active').length,
    disputed:  escrows.filter(e => e.state === 'disputed').length,
    complete:  escrows.filter(e => e.state === 'complete').length,
    cancelled: escrows.filter(e => e.state === 'cancelled').length,
    locked:    escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n),
    released:  escrows.reduce((a, e) => a + e.released, 0n),
  }), [escrows]);
}
