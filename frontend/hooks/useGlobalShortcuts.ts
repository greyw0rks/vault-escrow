'use client';
import { useRouter } from 'next/navigation';
import { useKeyPress } from './useKeyPress';
import { KEYMAP } from '@/lib/keymap';

export function useGlobalShortcuts(onRefresh?: () => void) {
  const router = useRouter();
  useKeyPress(KEYMAP.NEW_ESCROW, () => router.push('/escrow/new'));
  useKeyPress(KEYMAP.DASHBOARD,  () => router.push('/dashboard'));
  useKeyPress(KEYMAP.REFRESH,    () => onRefresh?.());
  useKeyPress(KEYMAP.SEARCH, (e) => {
    e.preventDefault();
    document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
  });
}
