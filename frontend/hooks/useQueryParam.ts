'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParam(key: string) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = params.get(key) ?? '';

  const setValue = useCallback((val: string) => {
    const p = new URLSearchParams(params.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(pathname + (p.toString() ? '?' + p.toString() : ''));
  }, [key, params, router, pathname]);

  return [value, setValue] as const;
}
