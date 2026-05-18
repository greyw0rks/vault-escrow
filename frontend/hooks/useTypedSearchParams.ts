'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useTypedSearchParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const set = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    p.set(key, value);
    router.push(pathname + '?' + p.toString());
  }, [params, router, pathname]);

  const remove = useCallback((key: string) => {
    const p = new URLSearchParams(params.toString());
    p.delete(key);
    router.push(pathname + '?' + p.toString());
  }, [params, router, pathname]);

  return { params, set, remove };
}
