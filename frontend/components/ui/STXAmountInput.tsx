'use client';
import { stxToMicro } from '@/lib/contract';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label?: string;
}

export function STXAmountInput({ value, onChange, error, label = 'Amount (STX)' }: Props) {
  const micro = value ? stxToMicro(value) : 0n;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</label>
      <input
        type="number" step="0.000001" min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: 'var(--raised)', border: '1px solid ' + (error ? '#A32D2D' : 'var(--border)'), borderRadius: 'var(--radius)', padding: '.625rem .875rem', color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.9rem', width: '100%', boxSizing: 'border-box' as const }}
      />
      {value && !error && (
        <span style={{ fontSize: '.6875rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>= {micro.toLocaleString()} μSTX</span>
      )}
      {error && <span style={{ fontSize: '.75rem', color: '#A32D2D' }}>{error}</span>}
    </div>
  );
}
