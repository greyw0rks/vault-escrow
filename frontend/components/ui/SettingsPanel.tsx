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
