// Stacks mainnet: ~10 min/block; testnet: ~2 min/block
const BLOCK_TIME_MS = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 600_000 : 120_000;

export function estimateTime(fromBlock: number, toBlock: number): string {
  const diff = toBlock - fromBlock;
  if (diff <= 0) return 'now';
  const ms = diff * BLOCK_TIME_MS;
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return mins + 'm';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h';
  return Math.round(hrs / 24) + 'd';
}

export function blocksAgo(block: number, currentBlock: number): string {
  return estimateTime(block, currentBlock) === 'now' ? 'just now' : estimateTime(block, currentBlock) + ' ago';
}
