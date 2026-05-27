'use client';
import { useState, useEffect } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    mq.addEventListener('change', e => setReduced(e.matches));
  }, []);
  return reduced;
}
