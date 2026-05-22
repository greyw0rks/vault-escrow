'use client';

interface Tab<T extends string> { id: T; label: string; }
interface Props<T extends string> { tabs: Tab<T>[]; active: T; onChange: (t: T) => void; }

export function TabBar<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3px', width: 'fit-content' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '.375rem 1.25rem', borderRadius: '4px', border: 'none',
          background: active === t.id ? 'var(--gold)' : 'transparent',
          color: active === t.id ? '#1A1000' : 'var(--muted)',
          fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem',
          fontWeight: active === t.id ? 600 : 400, cursor: 'pointer',
          transition: 'all .15s',
        }}>{t.label}</button>
      ))}
    </div>
  );
}
