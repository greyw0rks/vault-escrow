'use client';
import { useState, useEffect, useCallback } from 'react';

interface Settings { autoRefresh: boolean; showUSDValues: boolean; compactView: boolean; }
const DEFAULTS: Settings = { autoRefresh: true, showUSDValues: true, compactView: false };
const KEY = 'vault:settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try { setSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? DEFAULTS); } catch {}
  }, []);

  const update = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { settings, update };
}
