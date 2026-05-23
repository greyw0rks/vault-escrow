export function bigMin(a: bigint, b: bigint): bigint { return a < b ? a : b; }
export function bigMax(a: bigint, b: bigint): bigint { return a > b ? a : b; }
export function bigAbs(a: bigint): bigint { return a < 0n ? -a : a; }

export function bigPct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((part * 10000n) / total) / 100;
}

export function safeSub(a: bigint, b: bigint): bigint {
  return a >= b ? a - b : 0n;
}
