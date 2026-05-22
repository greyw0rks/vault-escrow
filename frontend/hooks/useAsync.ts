'use client';
import { useState, useCallback } from 'react';

type AsyncState<T> = { data: T | null; loading: boolean; error: string | null; };

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: false, error: null });

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message });
      return null;
    }
  }, []);

  return { ...state, run };
}
