export function escrowProgress(released: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round(Number(released) * 100 / Number(total));
}

export function splitEqually(total: bigint, parts: number): bigint[] {
  if (parts === 0) return [];
  const base = total / BigInt(parts);
  const remainder = total % BigInt(parts);
  return Array.from({ length: parts }, (_, i) => i === 0 ? base + remainder : base);
}

export function sumBigInt(values: bigint[]): bigint {
  return values.reduce((acc, v) => acc + v, 0n);
}
