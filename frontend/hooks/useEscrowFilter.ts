import { useMemo } from 'react';
import type { Escrow, EscrowState } from '@/lib/contract';

interface Options {
  state?: EscrowState | 'all';
  address?: string | null;
  role?: 'client' | 'worker' | 'resolver' | 'any';
}

export function useEscrowFilter(escrows: Escrow[], opts: Options = {}) {
  return useMemo(() => {
    let result = [...escrows];
    if (opts.state && opts.state !== 'all') result = result.filter(e => e.state === opts.state);
    if (opts.address && opts.role && opts.role !== 'any') {
      result = result.filter(e => {
        if (opts.role === 'client') return e.client === opts.address;
        if (opts.role === 'worker') return e.worker === opts.address;
        if (opts.role === 'resolver') return e.resolver === opts.address;
        return true;
      });
    }
    return result.sort((a, b) => b.id - a.id);
  }, [escrows, opts.state, opts.address, opts.role]);
}
