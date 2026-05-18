'use client';
import { useState, useEffect, useCallback } from 'react';

type TxStatus = 'pending' | 'success' | 'abort_by_response' | 'not_found';
const POLL_MS = 5000;

export function useTransactionStatus(txId: string | null) {
  const [status, setStatus] = useState<TxStatus>('pending');
  const [loading, setLoading] = useState(false);

  const poll = useCallback(async () => {
    if (!txId) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.testnet.hiro.so/extended/v1/tx/' + txId);
      if (res.status === 404) { setStatus('not_found'); return; }
      const data = await res.json();
      setStatus(data.tx_status ?? 'pending');
    } catch (_) {} finally { setLoading(false); }
  }, [txId]);

  useEffect(() => {
    if (!txId) return;
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [txId, poll]);

  return { status, confirmed: status === 'success', failed: status === 'abort_by_response', loading };
}
