'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/contract';

export function useContractRead(functionName: string, functionArgs: any[] = []) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      });
      setData(cvToValue(result));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [functionName]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}
