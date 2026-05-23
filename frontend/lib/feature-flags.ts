const FLAGS = {
  SHOW_STX_PRICE:   process.env.NEXT_PUBLIC_FF_STX_PRICE   !== 'false',
  SHOW_ACTIVITY:    process.env.NEXT_PUBLIC_FF_ACTIVITY     !== 'false',
  EXPORT_CSV:       process.env.NEXT_PUBLIC_FF_EXPORT_CSV   !== 'false',
  TABLE_VIEW:       process.env.NEXT_PUBLIC_FF_TABLE_VIEW   !== 'false',
  RECENT_ESCROWS:   process.env.NEXT_PUBLIC_FF_RECENT       !== 'false',
} as const;

export type Flag = keyof typeof FLAGS;

export function isEnabled(flag: Flag): boolean {
  return FLAGS[flag];
}
