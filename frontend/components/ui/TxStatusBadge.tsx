'use client';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

export function TxStatusBadge({ txId }: { txId: string }) {
  const { confirmed, failed } = useTransactionStatus(txId);
  const color = confirmed ? '#1D9E75' : failed ? '#A32D2D' : '#EF9F27';
  const label = confirmed ? 'Confirmed' : failed ? 'Failed' : 'Pending';
  return (
    <span style={{ background: color + '22', color, border: '1px solid ' + color + '44', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px' }}>
      {label}
    </span>
  );
}
