'use client';
import { isValidPrincipal } from '@/lib/validation';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

export function PrincipalInput({ value, onChange, error, label = 'Address', placeholder = 'SP…' }: Props) {
  const valid = value.length > 0 && isValidPrincipal(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</label>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ background: 'var(--raised)', border: '1px solid ' + (error ? '#A32D2D' : valid ? '#1D9E75' : 'var(--border)'), borderRadius: 'var(--radius)', padding: '.625rem .875rem', color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.875rem', width: '100%', boxSizing: 'border-box' as const }}
      />
      {error && <span style={{ fontSize: '.75rem', color: '#A32D2D' }}>{error}</span>}
    </div>
  );
}
