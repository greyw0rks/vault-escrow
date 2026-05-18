'use client';

interface Props { value: string; onChange: (v: string) => void; placeholder?: string; }

export function SearchBar({ value, onChange, placeholder = 'Search by ID or address…' }: Props) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.625rem .875rem .625rem 2.25rem', color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.875rem', width: '100%', outline: 'none', boxSizing: 'border-box' as const }}
      />
      <span style={{ position: 'absolute', left: '.75rem', color: 'var(--muted)', fontSize: '.875rem', pointerEvents: 'none' }}>⌕</span>
      {value && (
        <button onClick={() => onChange('')} style={{ position: 'absolute', right: '.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '.875rem' }}>×</button>
      )}
    </div>
  );
}
