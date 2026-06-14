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

# ── DashboardPage.tsx ──
mkdir -p components/ui
cat > components/ui/DashboardPage.tsx << 'FILEOF'
'use client';
import { useDashboardState } from '@/hooks/useDashboardState';
import { ConnectPrompt } from './ConnectPrompt';
import { EscrowListControls } from './EscrowListControls';
import { EscrowGrid } from './EscrowGrid';
import { EscrowTable } from './EscrowTable';
import { SummaryPanel } from './SummaryPanel';
import { RecentEscrows } from './RecentEscrows';
import { PageHeader } from './PageHeader';
import Link from 'next/link';

export function DashboardPage() {
  const state = useDashboardState();
  if (!state.connected) return <ConnectPrompt message="Connect your wallet to view your escrows." />;

  return (
    <div>
      <PageHeader title="Dashboard" sub={state.address ?? undefined} action={<Link href="/escrow/new" className="btn-primary">+ New Escrow</Link>} />
      <SummaryPanel escrows={state.escrows} address={state.address} />
      <RecentEscrows />
      <EscrowListControls
        query={state.query} onQuery={state.setQuery}
        filter={state.filter} onFilter={state.setFilter}
        viewMode={state.mode} onToggleView={state.toggleMode}
        escrows={state.results}
      />
      {state.mode === 'cards'
        ? <EscrowGrid escrows={state.results} address={state.address} loading={state.loading} filtered={state.filter !== 'all' || !!state.query} />
        : <EscrowTable escrows={state.results} address={state.address} />
      }
    </div>
  );
}
FILEOF
commit "components/ui/DashboardPage.tsx" "Add DashboardPage: fully composed dashboard using state hook"

# ── useKeyboardNav.ts ──
mkdir -p hooks
cat > hooks/useKeyboardNav.ts << 'FILEOF'
'use client';
import { useEffect, useCallback } from 'react';

export function useKeyboardNav(onNext: () => void, onPrev: () => void, enabled = true) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); onNext(); }
    if (e.key === 'ArrowUp'   || e.key === 'k') { e.preventDefault(); onPrev(); }
  }, [onNext, onPrev, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
FILEOF
commit "hooks/useKeyboardNav.ts" "Add useKeyboardNav: keyboard navigation for escrow lists"

# ── config.ts ──
mkdir -p lib
cat > lib/config.ts << 'FILEOF'
import { ENV } from './env';

export const CONFIG = {
  app: {
    name:    'VaultSTX',
    version: '0.1.0',
    icon:    '/logo.svg',
  },
  network: {
    name:       ENV.network,
    isMainnet:  ENV.isMainnet,
    apiBase:    ENV.apiBase,
    contractAddress: ENV.contractAddress,
    contractName:    'vaultstx-escrow',
  },
  ui: {
    scanLimit:      50,
    pollIntervalMs: 15_000,
    cacheTtlMs:     30_000,
    pageSize:       10,
  },
} as const;
FILEOF
commit "lib/config.ts" "Add config: centralized runtime configuration object"

echo ""
echo "🎯 July 29 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
