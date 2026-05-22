'use client';
import { useEffect, useRef } from 'react';

export function useEscrowPolling(refetch: () => void, intervalMs = 15_000, enabled = true) {
  const fn = useRef(refetch);
  useEffect(() => { fn.current = refetch; }, [refetch]);

  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => fn.current(), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, enabled]);
}
