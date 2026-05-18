'use client';
import { useClipboard } from '@/hooks/useClipboard';

export function ShareButton({ escrowId }: { escrowId: number }) {
  const { copy, copied } = useClipboard();
  const url = typeof window !== 'undefined' ? window.location.origin + '/escrow/' + escrowId : '';
  return (
    <button className="btn-ghost" onClick={() => copy(url)} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}>
      {copied ? '✓ Link copied' : 'Share'}
    </button>
  );
}
