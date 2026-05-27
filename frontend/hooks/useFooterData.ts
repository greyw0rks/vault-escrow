'use client';
import { useBlockHeight } from './useBlockHeight';
import { useNetworkStatus } from './useNetworkStatus';
import { BRAND } from '@/lib/brand';

export function useFooterData() {
  const height = useBlockHeight();
  const { online } = useNetworkStatus();
  return { height, online, brand: BRAND };
}
