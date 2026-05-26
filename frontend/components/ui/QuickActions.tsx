'use client';
import { useToggle } from '@/hooks/useToggle';

interface Action { label: string; icon: string; onClick: () => void; disabled?: boolean; }

export function QuickActions({ actions }: { actions: Action[] }) {
  const [open, toggle, , close] = useToggle(false);
  const enabled = actions.filter(a => !a.disabled);
  if (enabled.length === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={toggle} className="btn-primary" style={{ padding: '.5rem 1rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
        Actions <span style={{ fontSize: '.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + .375rem)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minWidth: 200, zIndex: 50, overflow: 'hidden' }}>
          {enabled.map((action, i) => (
            <button key={i} onClick={() => { action.onClick(); close(); }}
              style={{ width: '100%', padding: '.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.625rem', borderBottom: i < enabled.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--raised)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>{action.icon}</span>{action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
