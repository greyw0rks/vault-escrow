'use client';
import { useLocalStorage } from './useLocalStorage';

const MAX = 5;

export function useRecentEscrows() {
  const [recent, setRecent] = useLocalStorage<number[]>('vault:recent-escrows', []);

  const add = (id: number) => {
    setRecent(ids => [id, ...ids.filter(i => i !== id)].slice(0, MAX));
  };

  const clear = () => setRecent([]);

  return { recent, add, clear };
}
