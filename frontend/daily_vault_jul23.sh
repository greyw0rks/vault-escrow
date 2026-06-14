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

# ── ContractEventFeed.tsx ──
mkdir -p components/ui
cat > components/ui/ContractEventFeed.tsx << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { fetchContractEvents, type ContractEvent } from '@/lib/contract-events';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/contract';

export function ContractEventFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const contractId = CONTRACT_ADDRESS + '.' + CONTRACT_NAME;

  useEffect(() => {
    fetchContractEvents(contractId).then(setEvents);
    const t = setInterval(() => fetchContractEvents(contractId).then(setEvents), 30_000);
    return () => clearInterval(t);
  }, [contractId]);

  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Contract Events</div>
      {events.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>No events yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'var(--raised)', borderRadius: 'var(--radius)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem' }}>
              <span style={{ color: 'var(--gold)' }}>{ev.type}</span>
              <span style={{ color: 'var(--muted)' }}>#{ev.block}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
FILEOF
commit "components/ui/ContractEventFeed.tsx" "Add ContractEventFeed: live contract event log display"

# ── useContractEvents.ts ──
mkdir -p hooks
cat > hooks/useContractEvents.ts << 'FILEOF'
'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchContractEvents, type ContractEvent } from '@/lib/contract-events';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/contract';

export function useContractEvents(pollMs = 30_000) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const contractId = CONTRACT_ADDRESS + '.' + CONTRACT_NAME;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try { setEvents(await fetchContractEvents(contractId)); }
    catch (_) {} finally { setLoading(false); }
  }, [contractId]);

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, pollMs);
    return () => clearInterval(t);
  }, [fetch_, pollMs]);

  return { events, loading, refetch: fetch_ };
}
FILEOF
commit "hooks/useContractEvents.ts" "Add useContractEvents: fetch and poll contract event log"

# ── invariant.ts ──
mkdir -p lib
cat > lib/invariant.ts << 'FILEOF'
export function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    const err = new Error('[VaultSTX invariant] ' + message);
    if (process.env.NODE_ENV !== 'production') throw err;
    console.error(err);
  }
}

export function unreachable(value: never): never {
  throw new Error('[VaultSTX] Unreachable: ' + JSON.stringify(value));
}
FILEOF
commit "lib/invariant.ts" "Add invariant: production-safe invariant assertion helper"

echo ""
echo "🎯 July 23 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
