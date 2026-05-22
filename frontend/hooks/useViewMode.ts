'use client';
import { useLocalStorage } from './useLocalStorage';

export type ViewMode = 'cards' | 'table';

export function useViewMode(defaultMode: ViewMode = 'cards') {
  const [mode, setMode] = useLocalStorage<ViewMode>('vault:view-mode', defaultMode);
  const toggleMode = () => setMode(m => m === 'cards' ? 'table' : 'cards');
  return { mode, setMode, toggleMode, isCards: mode === 'cards', isTable: mode === 'table' };
}
