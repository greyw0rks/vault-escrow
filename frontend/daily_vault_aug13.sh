#!/usr/bin/env bash
set -e
cd ~/Vaultstx/frontend

COUNT=0
commit() {
  git add "$1"
  git commit -q -m "$2"
  COUNT=$((COUNT+1))
  echo "✅ $2"
}

# -- SettingsPanel.tsx --
mkdir -p components/ui
cat > components/ui/SettingsPanel.tsx << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

interface LocalConfig {
  autoRefresh: boolean;
  showUSDValues: boolean;
  compactView: boolean;
}

const DEFAULTS: LocalConfig = { autoRefresh: true, showUSDValues: true, compactView: false };
const KEY = 'vault:settings';

function load(): LocalConfig {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? DEFAULTS; } catch { return DEFAULTS; }
}

function save(c: LocalConfig) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
}

export function SettingsPanel() {
  const [config, setConfig] = useState<LocalConfig>(DEFAULTS);
  useEffect(() => setConfig(load()), []);

  const update = (key: keyof LocalConfig, value: boolean) => {
    const next = { ...config, [key]: value };
    setConfig(next); save(next);
  };

  const rows: { key: keyof LocalConfig; label: string }[] = [
    { key: 'autoRefresh',   label: 'Auto refresh' },
    { key: 'showUSDValues', label: 'Show USD values' },
    { key: 'compactView',   label: 'Compact view' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {rows.map(row => (
        <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.625rem 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '.875rem' }}>{row.label}</span>
          <button onClick={() => update(row.key, !config[row.key])}
            style={{ width: 40, height: 22, borderRadius: 11, background: config[row.key] ? 'var(--gold)' : 'var(--raised)', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
            <span style={{ position: 'absolute', top: 2, left: config[row.key] ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: config[row.key] ? '#1A1000' : 'var(--muted)', transition: 'left .2s' }} />
          </button>
        </div>
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/SettingsPanel.tsx" "Add SettingsPanel: user preferences settings panel"

# -- useSettings.ts --
mkdir -p hooks
cat > hooks/useSettings.ts << 'FILEOF'
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
FILEOF
commit "hooks/useSettings.ts" "Add useSettings: reactive hook for user settings"

# -- health.ts --
mkdir -p lib
cat > lib/health.ts << 'FILEOF'
import { getBlockHeight } from './stacks-api';
import { ENV } from './env';

export interface HealthStatus {
  api:      'ok' | 'error';
  contract: 'configured' | 'missing';
  network:  string;
  block:    number;
}

export async function checkHealth(): Promise<HealthStatus> {
  let block = 0;
  let apiStatus: 'ok' | 'error' = 'error';
  try { block = await getBlockHeight(); apiStatus = 'ok'; } catch {}
  return {
    api:      apiStatus,
    contract: ENV.contractAddress ? 'configured' : 'missing',
    network:  ENV.network,
    block,
  };
}
FILEOF
commit "lib/health.ts" "Add health: app health check utilities for monitoring"

echo ""
echo "🎯 August 13 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
