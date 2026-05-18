'use client';
import { useState, useEffect } from 'react';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/contract';

export function useEscrowCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-escrow-count',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    }).then(r => setCount(Number(cvToValue(r))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { count, loading };
}
