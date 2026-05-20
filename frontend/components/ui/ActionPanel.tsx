'use client';
import type { Escrow, Milestone } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';

interface Props {
  escrow: Escrow;
  milestone: Milestone;
  index: number;
  isClient: boolean;
  isWorker: boolean;
  isResolver: boolean;
  loading: boolean;
  onSubmit: () => void;
  onApprove: () => void;
  onDispute: () => void;
  onResolve: (toWorker: boolean) => void;
}

export function ActionPanel({ escrow: e, milestone: ms, index, isClient, isWorker, isResolver, loading, onSubmit, onApprove, onDispute, onResolve }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1rem' }}>
      {isWorker && ms.state === 'pending' && e.state === 'active' && (
        <button className="btn-primary btn-sm" onClick={onSubmit} disabled={loading}>Submit for review</button>
      )}
      {isClient && ms.state === 'submitted' && e.state === 'active' && (
        <>
          <button className="btn-success btn-sm" onClick={onApprove} disabled={loading}>Approve & release {microToSTX(ms.amount)} STX</button>
          <button className="btn-danger btn-sm" onClick={onDispute} disabled={loading}>Raise dispute</button>
        </>
      )}
      {isWorker && ms.state === 'submitted' && e.state === 'active' && (
        <button className="btn-danger btn-sm" onClick={onDispute} disabled={loading}>Raise dispute</button>
      )}
      {isResolver && ms.state === 'disputed' && e.state === 'disputed' && (
        <>
          <button className="btn-success btn-sm" onClick={() => onResolve(true)} disabled={loading}>Release to worker</button>
          <button className="btn-warning btn-sm" onClick={() => onResolve(false)} disabled={loading}>Refund client</button>
        </>
      )}
    </div>
  );
}
