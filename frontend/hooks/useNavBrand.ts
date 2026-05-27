'use client';
import { usePathname } from 'next/navigation';

export function useNavBrand() {
  const pathname = usePathname();
  return {
    pathname,
    isRoot: pathname === '/',
    showBack: pathname !== '/' && !pathname.startsWith('/dashboard'),
  };
}
