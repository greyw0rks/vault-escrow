'use client';
import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [optimistic, setOptimistic] = useState<T | null>(null);

  const display = optimistic ?? value;

  const apply = useCallback((next: T) => setOptimistic(next), []);
  const confirm = useCallback((confirmed: T) => { setValue(confirmed); setOptimistic(null); }, []);
  const revert = useCallback(() => setOptimistic(null), []);

  return { display, apply, confirm, revert, isOptimistic: optimistic !== null };
}
