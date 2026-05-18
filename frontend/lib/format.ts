export function formatSTX(micro: bigint, decimals = 2): string {
  return (Number(micro) / 1_000_000).toFixed(decimals).replace(/\.?0+\$/, '') + ' STX';
}

export function shortAddress(addr: string, head = 6, tail = 4): string {
  if (!addr) return '';
  return addr.slice(0, head) + '\u2026' + addr.slice(-tail);
}

export function formatBlock(blockHeight: number): string {
  return 'Block #' + blockHeight.toLocaleString();
}
