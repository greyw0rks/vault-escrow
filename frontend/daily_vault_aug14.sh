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

# -- HealthDashboard.tsx --
mkdir -p components/ui
cat > components/ui/HealthDashboard.tsx << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { checkHealth, type HealthStatus } from '@/lib/health';

export function HealthDashboard() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  useEffect(() => { checkHealth().then(setStatus); }, []);
  if (process.env.NODE_ENV !== 'development' || !status) return null;

  return (
    <div style={{ position: 'fixed', bottom: 60, left: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', zIndex: 999 }}>
      <div style={{ color: 'var(--muted)', marginBottom: '.5rem', textTransform: 'uppercase' }}>Health</div>
      {[
        { label: 'API',      value: status.api,      ok: status.api === 'ok' },
        { label: 'Contract', value: status.contract,  ok: status.contract === 'configured' },
        { label: 'Network',  value: status.network,   ok: true },
        { label: 'Block',    value: String(status.block), ok: status.block > 0 },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '.25rem' }}>
          <span style={{ color: 'var(--muted)' }}>{r.label}</span>
          <span style={{ color: r.ok ? '#1D9E75' : '#A32D2D' }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/HealthDashboard.tsx" "Add HealthDashboard: dev-mode app health status panel"

# -- useHealthCheck.ts --
mkdir -p hooks
cat > hooks/useHealthCheck.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { checkHealth, type HealthStatus } from '@/lib/health';

export function useHealthCheck(intervalMs = 60_000) {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try { setStatus(await checkHealth()); } finally { setChecking(false); }
  };

  useEffect(() => {
    check();
    const t = setInterval(check, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return { status, checking, healthy: status?.api === 'ok' };
}
FILEOF
commit "hooks/useHealthCheck.ts" "Add useHealthCheck: periodic app health status polling"

# -- feature-flags-aug.ts --
mkdir -p lib
cat > lib/feature-flags-aug.ts << 'FILEOF'
export const FEATURES = {
  KEYBOARD_SHORTCUTS: true,
  AUDIT_LOG:          true,
  DETAIL_TABS:        true,
  MOBILE_DRAWER:      true,
  SCROLL_PROGRESS:    true,
  SETTINGS_PANEL:     true,
  HEALTH_DASHBOARD:   process.env.NODE_ENV === 'development',
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
FILEOF
commit "lib/feature-flags-aug.ts" "Add feature-flags-aug: August feature flag constants"

echo ""
echo "🎯 August 14 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
