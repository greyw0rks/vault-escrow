'use client';
import { useState } from 'react';

type Variant = 'info' | 'warning' | 'error' | 'success';

const COLORS: Record<Variant, string> = {
  info:    '#7C6AF7',
  warning: '#EF9F27',
  error:   '#A32D2D',
  success: '#1D9E75',
};

interface Props { message: string; variant?: Variant; dismissible?: boolean; }

export function AlertBanner({ message, variant = 'info', dismissible = true }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const color = COLORS[variant];
  return (
    <div style={{ background: color + '15', border: '1px solid ' + color + '44', borderRadius: 'var(--radius)', padding: '.875rem 1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
      <span style={{ color, flex: 1, fontSize: '.875rem', fontFamily: "'DM Sans',sans-serif" }}>{message}</span>
      {dismissible && (
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}
