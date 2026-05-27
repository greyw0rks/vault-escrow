'use client';
import { useToggle } from '@/hooks/useToggle';
import { useKeyPress } from '@/hooks/useKeyPress';
import { KEYMAP, formatKey } from '@/lib/keymap';

const SHORTCUTS = [
  { key: KEYMAP.SEARCH,    desc: 'Focus search' },
  { key: KEYMAP.NEW_ESCROW,desc: 'New escrow' },
  { key: KEYMAP.DASHBOARD, desc: 'Go to dashboard' },
  { key: KEYMAP.REFRESH,   desc: 'Refresh data' },
  { key: KEYMAP.NEXT,      desc: 'Next item' },
  { key: KEYMAP.PREV,      desc: 'Previous item' },
  { key: '?',              desc: 'Show shortcuts' },
];

export function KeyboardShortcuts() {
  const [open, toggle, , close] = useToggle(false);
  useKeyPress('?', toggle);
  useKeyPress('Escape', close);
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={close}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', minWidth: 320 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem', fontFamily: "'Playfair Display',serif" }}>Keyboard Shortcuts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{desc}</span>
              <kbd style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 4, padding: '.125rem .5rem', color: 'var(--text)' }}>{formatKey(key)}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
