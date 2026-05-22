export const MICRO = 1_000_000n;

export function stxToMicro(stx: number): bigint {
  return BigInt(Math.round(stx * 1_000_000));
}

export function microToSTXNum(micro: bigint): number {
  return Number(micro) / 1_000_000;
}

export function formatMicro(micro: bigint, decimals = 2): string {
  return microToSTXNum(micro).toFixed(decimals) + ' STX';
}

export function pct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}
