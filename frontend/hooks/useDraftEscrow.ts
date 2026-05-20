'use client';
import { storageGet, storageSet, storageDel } from '@/lib/storage';

const KEY = 'vault:draft-escrow';

interface Draft {
  worker: string;
  resolver: string;
  deposit: string;
  milestones: { description: string; amount: string }[];
}

const EMPTY: Draft = { worker: '', resolver: '', deposit: '', milestones: [] };

export function useDraftEscrow() {
  const load = (): Draft => storageGet<Draft>(KEY, EMPTY);
  const save = (d: Draft) => storageSet(KEY, d);
  const clear = () => storageDel(KEY);
  return { load, save, clear };
}
