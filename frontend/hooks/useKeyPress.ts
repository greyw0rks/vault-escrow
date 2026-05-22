'use client';
import { useEffect } from 'react';

export function useKeyPress(key: string, handler: (e: KeyboardEvent) => void, deps: unknown[] = []) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key) handler(e);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, deps);
}
