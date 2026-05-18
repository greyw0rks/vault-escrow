'use client';
import { useEffect, useState } from 'react';

interface Props { txId: string | null; onDismiss: () => void; }

export function TxToast({ txId, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (txId) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); onDismiss(); }, 6000);
      return () => clearTimeout(t);
    }
  }, [txId, onDismiss]);

  if (!visible || !txId) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      background: 'var(--surface)', border: '1px solid #1D9E75',
      borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem',
      color: 'var(--text)', maxWidth: 360, zIndex: 999,
      boxShadow: '0 4px 24px rgba(0,0,0,.4)',
    }}>
      <div style={{ color: '#1D9E75', marginBottom: '.375rem' }}>✓ Transaction broadcast</div>
      <div style={{ color: 'var(--muted)', wordBreak: 'break-all' }}>{txId.slice(0, 24)}…</div>
    </div>
  );
}
