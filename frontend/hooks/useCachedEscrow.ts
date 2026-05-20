'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchEscrow, type Escrow } from '@/lib/contract';
import { cacheGet, cacheSet } from '@/lib/cache';

export function useCachedEscrow(id: number | null) {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const key = 'escrow:' + id;
    const cached = cacheGet<Escrow>(key);
    if (cached) { setEscrow(cached); return; }
    setLoading(true);
    try {
      const e = await fetchEscrow(id);
      if (e) { cacheSet(key, e); setEscrow(e); }
    } catch (_) {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { escrow, loading, refetch: load };
}
