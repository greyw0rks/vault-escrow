export const APP = {
  name:     'VaultSTX',
  version:  '0.1.0',
  network:  process.env.NEXT_PUBLIC_NETWORK ?? 'testnet',
  contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '',
} as const;

export const LIMITS = {
  MAX_MILESTONES:      10,
  MIN_DEPOSIT_STX:     1,
  MAX_DEPOSIT_STX:     1_000_000,
  MAX_DESC_LEN:        256,
  MIN_DESC_LEN:        3,
  SCAN_BATCH:          10,
  POLL_MS:             15_000,
  CACHE_TTL_MS:        30_000,
  PAGE_SIZE:           10,
} as const;

export const COLORS = {
  gold:    '#EF9F27',
  green:   '#1D9E75',
  red:     '#A32D2D',
  purple:  '#7C6AF7',
  muted:   '#5F5E5A',
} as const;
