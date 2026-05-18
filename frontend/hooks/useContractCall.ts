'use client';
import { useState } from 'react';
import { useConnect } from '@stacks/connect-react';

export function useContractCall() {
  const { doContractCall } = useConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const call = async (txOptions: object, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);
    try {
      await doContractCall({
        ...(txOptions as any),
        onFinish: (data: any) => {
          setTxId(data.txId ?? null);
          setLoading(false);
          onSuccess?.();
        },
        onCancel: () => setLoading(false),
      } as any);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return { call, loading, error, txId };
}
