export const TOKENS = {
  gold:     'var(--gold)',
  muted:    'var(--muted)',
  surface:  'var(--surface)',
  raised:   'var(--raised)',
  border:   'var(--border)',
  borderHi: 'var(--border-hi)',
  text:     'var(--text)',
  radius:   'var(--radius)',
  radiusLg: 'var(--radius-lg)',
} as const;

export const STATE_COLORS = {
  open:      '#EF9F27',
  active:    '#1D9E75',
  disputed:  '#A32D2D',
  complete:  '#1D9E75',
  cancelled: '#5F5E5A',
} as const;

export const MS_COLORS = {
  pending:   '#5F5E5A',
  submitted: '#EF9F27',
  approved:  '#1D9E75',
  disputed:  '#A32D2D',
} as const;
