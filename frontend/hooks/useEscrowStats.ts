import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';

export function useEscrowStats(escrows: Escrow[], address: string | null) {
  return useMemo(() => {
    const mine = escrows.filter(e => e.client === address || e.worker === address);
    const totalLocked = escrows.reduce((acc, e) => acc + e.totalAmount - e.released, 0n);
    const totalReleased = escrows.reduce((acc, e) => acc + e.released, 0n);
    return {
      total:        escrows.length,
      mine:         mine.length,
      active:       escrows.filter(e => e.state === 'active').length,
      disputed:     escrows.filter(e => e.state === 'disputed').length,
      complete:     escrows.filter(e => e.state === 'complete').length,
      totalLocked,
      totalReleased,
    };
  }, [escrows, address]);
}
