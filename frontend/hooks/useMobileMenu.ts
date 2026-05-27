'use client';
import { useToggle } from './useToggle';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useMobileMenu() {
  const [open, toggle, , close] = useToggle(false);
  const pathname = usePathname();
  useEffect(() => close(), [pathname]);
  return { open, toggle, close };
}
