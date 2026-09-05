'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGE_SIZE, fetchEscrowCount, fetchEscrowPage, type Escrow } from '../lib/contract';

/**
 * Paged escrow list, newest first.
 *
 * The previous dashboard scanned ids 1..20 and broke on the first gap, so on a
 * chain with ~1,800 escrows it always showed the twenty oldest — which meant
 * "My Escrows" was empty for everyone. Reading from the highest id down fixes
 * that, and `scan` widens the window when filtering by address.
 */
export function useEscrows(scan = PAGE_SIZE) {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const highest = await fetchEscrowCount();
      setTotal(highest);
      setEscrows(await fetchEscrowPage(highest, 0, scan));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [scan]);

  useEffect(() => { load(); }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || escrows.length >= total) return;
    setLoading(true);
    try {
      const next = await fetchEscrowPage(total, escrows.length, PAGE_SIZE);
      setEscrows((prev) => [...prev, ...next]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [escrows.length, loading, total]);

  return {
    escrows,
    total,
    loading,
    error,
    hasMore: escrows.length < total,
    refresh: load,
    loadMore,
  };
}
