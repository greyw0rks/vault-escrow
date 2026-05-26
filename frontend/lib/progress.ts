export function calcProgress(released: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round(Number(released) * 100 / Number(total));
}

export function calcMilestoneProgress(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 100);
}

export function isComplete(released: bigint, total: bigint): boolean {
  return total > 0n && released >= total;
}
