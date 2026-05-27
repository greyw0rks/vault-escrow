'use client';
import { useState, useEffect } from 'react';
import { checkHealth, type HealthStatus } from '@/lib/health';

export function HealthDashboard() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  useEffect(() => { checkHealth().then(setStatus); }, []);
  if (process.env.NODE_ENV !== 'development' || !status) return null;

  return (
    <div style={{ position: 'fixed', bottom: 60, left: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', zIndex: 999 }}>
      <div style={{ color: 'var(--muted)', marginBottom: '.5rem', textTransform: 'uppercase' }}>Health</div>
      {[
        { label: 'API',      value: status.api,      ok: status.api === 'ok' },
        { label: 'Contract', value: status.contract,  ok: status.contract === 'configured' },
        { label: 'Network',  value: status.network,   ok: true },
        { label: 'Block',    value: String(status.block), ok: status.block > 0 },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '.25rem' }}>
          <span style={{ color: 'var(--muted)' }}>{r.label}</span>
          <span style={{ color: r.ok ? '#1D9E75' : '#A32D2D' }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
