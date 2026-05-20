'use client';
import { useState } from 'react';
import { STXAmountInput } from './STXAmountInput';

interface Props { onAdd: (description: string, amount: string) => void; }

export function NewMilestoneRow({ onAdd }: Props) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const submit = () => {
    if (!desc.trim() || !amount) return;
    onAdd(desc.trim(), amount);
    setDesc(''); setAmount('');
  };

  return (
    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ flex: 2, minWidth: 200 }}>
        <label style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: '.375rem' }}>Description</label>
        <input
          type="text" value={desc} placeholder="Milestone deliverable…"
          onChange={e => setDesc(e.target.value)}
          style={{ background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.625rem .875rem', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', width: '100%', boxSizing: 'border-box' as const }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <STXAmountInput value={amount} onChange={setAmount} label="Amount (STX)" />
      </div>
      <button className="btn-primary btn-sm" onClick={submit} style={{ marginBottom: '0' }}>+ Add</button>
    </div>
  );
}
