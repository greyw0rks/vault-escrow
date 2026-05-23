interface Props { keys: string[]; label?: string; }

export function KeyboardShortcutHint({ keys, label }: Props) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
      {label && <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginRight: '.25rem' }}>{label}</span>}
      {keys.map(k => (
        <kbd key={k} style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
          background: 'var(--raised)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '.125rem .375rem',
          color: 'var(--muted)', lineHeight: 1.5,
        }}>{k}</kbd>
      ))}
    </span>
  );
}
