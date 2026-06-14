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

# ── StaleBadge.tsx ──
mkdir -p components/ui
cat > components/ui/StaleBadge.tsx << 'FILEOF'
interface Props { stale: boolean; onRefresh: () => void; }

export function StaleBadge({ stale, onRefresh }: Props) {
  if (!stale) return null;
  return (
    <button onClick={onRefresh} style={{ background: 'rgba(239,159,39,.1)', border: '1px solid var(--gold-dim)', borderRadius: 20, padding: '.2rem .625rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.375rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--gold)' }}>
      ↻ stale · refresh
    </button>
  );
}
FILEOF
commit "components/ui/StaleBadge.tsx" "Add StaleBadge: indicator when displayed data may be outdated"

# ── useSignal.ts ──
mkdir -p hooks
cat > hooks/useSignal.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import type { Signal } from '@/lib/signal';

export function useSignal<T>(signal: Signal<T>): T {
  const [value, setValue] = useState(signal.get());
  useEffect(() => signal.subscribe(setValue), [signal]);
  return value;
}
FILEOF
commit "hooks/useSignal.ts" "Add useSignal: React hook to subscribe to a Signal value"

# ── contract-events.ts ──
mkdir -p lib
cat > lib/contract-events.ts << 'FILEOF'
export interface ContractEvent {
  type: string;
  txId: string;
  block: number;
  data: Record<string, unknown>;
}

export function parseStacksEvents(raw: unknown[]): ContractEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e: any) => e?.event_type === 'smart_contract_log')
    .map((e: any) => ({
      type:  e.contract_log?.value?.repr ?? 'unknown',
      txId:  e.tx_id ?? '',
      block: Number(e.block_height ?? 0),
      data:  e.contract_log ?? {},
    }));
}

export async function fetchContractEvents(contractId: string, limit = 20): Promise<ContractEvent[]> {
  const res = await fetch('https://api.testnet.hiro.so/extended/v1/contract/' + contractId + '/events?limit=' + limit);
  if (!res.ok) return [];
  const data = await res.json();
  return parseStacksEvents(data.results ?? []);
}
FILEOF
commit "lib/contract-events.ts" "Add contract-events: parse Stacks contract event logs"

echo ""
echo "🎯 July 22 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
