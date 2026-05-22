'use client';
import type { ViewMode } from '@/hooks/useViewMode';

interface Props { mode: ViewMode; onToggle: () => void; }

export function ViewToggle({ mode, onToggle }: Props) {
  return (
    <button onClick={onToggle} className="btn-ghost" style={{ padding: '.35rem .75rem', fontSize: '.8125rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
      {mode === 'cards' ? (
        <><span style={{ fontSize: '.875rem' }}>⊞</span> Table</>
      ) : (
        <><span style={{ fontSize: '.875rem' }}>❏</span> Cards</>
      )}
    </button>
  );
}
