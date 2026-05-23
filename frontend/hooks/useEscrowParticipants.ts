import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import type { Role } from '@/lib/types';

export interface Participant { address: string; role: Role; isYou: boolean; }

export function useEscrowParticipants(escrow: Escrow | null, myAddress: string | null): Participant[] {
  return useMemo(() => {
    if (!escrow) return [];
    return [
      { address: escrow.client,   role: 'client',   isYou: escrow.client   === myAddress },
      { address: escrow.worker,   role: 'worker',   isYou: escrow.worker   === myAddress },
      { address: escrow.resolver, role: 'resolver', isYou: escrow.resolver === myAddress },
    ];
  }, [escrow, myAddress]);
}
