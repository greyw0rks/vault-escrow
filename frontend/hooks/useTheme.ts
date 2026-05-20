'use client';
import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '@/lib/storage';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => storageGet<Theme>('vault:theme', 'dark'));

  useEffect(() => {
    storageSet('vault:theme', theme);
    document.documentElement.setAttribute('data-theme', theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
    );
  }, [theme]);

  return { theme, setTheme };
}
