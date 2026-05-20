'use client';
import { useExplorer } from '@/hooks/useExplorer';

interface Props {
  type: 'tx' | 'address';
  value: string;
  label?: string;
}

export function ExplorerLink({ type, value, label }: Props) {
  const { openTx, openAddress } = useExplorer();
  const onClick = () => type === 'tx' ? openTx(value) : openAddress(value);
  const display = label ?? (value.slice(0, 8) + '\u2026' + value.slice(-4));
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace",
      fontSize: '.8125rem', textDecoration: 'underline', textDecorationStyle: 'dotted',
    }}>
      {display} ↗
    </button>
  );
}
