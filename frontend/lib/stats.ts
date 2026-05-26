import type { Escrow } from './contract';

export function totalLocked(escrows: Escrow[]): bigint {
  return escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n);
}

export function totalReleased(escrows: Escrow[]): bigint {
  return escrows.reduce((a, e) => a + e.released, 0n);
}

export function averageAmount(escrows: Escrow[]): bigint {
  if (escrows.length === 0) return 0n;
  return escrows.reduce((a, e) => a + e.totalAmount, 0n) / BigInt(escrows.length);
}

export function disputeRate(escrows: Escrow[]): number {
  if (escrows.length === 0) return 0;
  return escrows.filter(e => e.state === 'disputed').length / escrows.length;
}
