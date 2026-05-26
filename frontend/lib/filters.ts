import type { Escrow, EscrowState } from './contract';

export function filterByState(escrows: Escrow[], state: EscrowState | 'all'): Escrow[] {
  if (state === 'all') return escrows;
  return escrows.filter(e => e.state === state);
}

export function filterByAddress(escrows: Escrow[], address: string): Escrow[] {
  return escrows.filter(e => e.client === address || e.worker === address || e.resolver === address);
}

export function filterByQuery(escrows: Escrow[], query: string): Escrow[] {
  if (!query.trim()) return escrows;
  const q = query.toLowerCase();
  return escrows.filter(e =>
    String(e.id).includes(q) ||
    e.client.toLowerCase().includes(q) ||
    e.worker.toLowerCase().includes(q)
  );
}
