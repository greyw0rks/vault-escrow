'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAccountSTX } from '@/lib/stacks-api';
import { microToSTX } from '@/lib/contract';

export function useAccountBalance(address: string | null) {
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try { setBalance(await getAccountSTX(address)); }
    catch (_) {} finally { setLoading(false); }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  return { balance, formatted: microToSTX(balance), loading, refetch: load };
}
