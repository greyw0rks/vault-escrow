export const KEYMAP = {
  SEARCH:      '/',
  NEW_ESCROW:  'n',
  DASHBOARD:   'd',
  REFRESH:     'r',
  ESCAPE:      'Escape',
  NEXT:        'j',
  PREV:        'k',
  CONFIRM:     'Enter',
} as const;

export type Key = typeof KEYMAP[keyof typeof KEYMAP];

export function formatKey(key: string): string {
  const MAP: Record<string, string> = { Escape: 'Esc', Enter: 'Enter', ArrowUp: 'Up', ArrowDown: 'Down' };
  return MAP[key] ?? key.toUpperCase();
}
