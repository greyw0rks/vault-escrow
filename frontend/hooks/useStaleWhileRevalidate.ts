'use client';
import { useState, useEffect, useCallback } from 'react';
import { cacheGet, cacheSet } from '@/lib/cache';

export function useStaleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30_000) {
  const [data, setData] = useState<T | null>(() => cacheGet<T>(key));
  const [loading, setLoading] = useState(!cacheGet<T>(key));

  const revalidate = useCallback(async () => {
    try {
      const fresh = await fetcher();
      cacheSet(key, fresh, ttlMs);
      setData(fresh);
    } catch (_) {} finally { setLoading(false); }
  }, [key, ttlMs]);

  useEffect(() => { revalidate(); }, [revalidate]);

  return { data, loading, revalidate };
}
