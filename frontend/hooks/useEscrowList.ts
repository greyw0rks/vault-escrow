'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchEscrow, type Escrow } from '@/lib/contract';

const SCAN_COUNT = 50;

export function useEscrowList() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const results: Escrow[] = [];
    try {
      for (let i = 1; i <= SCAN_COUNT; i++) {
        const e = await fetchEscrow(i);
        if (!e) break;
        results.push(e);
      }
      setEscrows(results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byState = escrows.reduce((acc, e) => {
    acc[e.state] = [...(acc[e.state] ?? []), e];
    return acc;
  }, {} as Record<string, Escrow[]>);

  return { escrows, byState, loading, error, refetch: load };
}
