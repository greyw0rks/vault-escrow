'use client';
import { useState, useEffect } from 'react';
import { getBlockHeight } from '@/lib/stacks-api';

export function useBlockHeight(pollMs = 30_000) {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    getBlockHeight().then(setHeight);
    const t = setInterval(() => getBlockHeight().then(setHeight), pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  return height;
}
