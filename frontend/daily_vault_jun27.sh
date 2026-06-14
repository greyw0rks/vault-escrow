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

# ── ParticipantCard.tsx ──
mkdir -p components/ui
cat > components/ui/ParticipantCard.tsx << 'FILEOF'
import { AddressAvatar } from './AddressAvatar';
import { RoleBadge } from './RoleBadge';
import { CopyButton } from './CopyButton';
import { formatShort } from '@/lib/format-address';
import type { Role } from '@/lib/types';

interface Props { address: string; role: Role; isYou?: boolean; }

export function ParticipantCard({ address, role, isYou }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem' }}>
      <AddressAvatar address={address} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <RoleBadge role={role} />
          {isYou && <span style={{ fontSize: '.6875rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>you</span>}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', marginTop: '.25rem', color: 'var(--muted)' }}>
          {formatShort(address)}
        </div>
      </div>
      <CopyButton text={address} />
    </div>
  );
}
FILEOF
commit "components/ui/ParticipantCard.tsx" "Add ParticipantCard: address card with avatar and role badge"

# ── useEscrowParticipants.ts ──
mkdir -p hooks
cat > hooks/useEscrowParticipants.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import type { Role } from '@/lib/types';

export interface Participant { address: string; role: Role; isYou: boolean; }

export function useEscrowParticipants(escrow: Escrow | null, myAddress: string | null): Participant[] {
  return useMemo(() => {
    if (!escrow) return [];
    return [
      { address: escrow.client,   role: 'client',   isYou: escrow.client   === myAddress },
      { address: escrow.worker,   role: 'worker',   isYou: escrow.worker   === myAddress },
      { address: escrow.resolver, role: 'resolver', isYou: escrow.resolver === myAddress },
    ];
  }, [escrow, myAddress]);
}
FILEOF
commit "hooks/useEscrowParticipants.ts" "Add useEscrowParticipants: derive participant roles from escrow"

# ── telemetry.ts ──
mkdir -p lib
cat > lib/telemetry.ts << 'FILEOF'
const ENABLED = process.env.NEXT_PUBLIC_TELEMETRY === 'true';

export function captureError(err: Error, context?: Record<string, unknown>) {
  if (!ENABLED) return;
  console.error('[VaultSTX telemetry]', err.message, context ?? '');
}

export function captureTiming(label: string, ms: number) {
  if (!ENABLED) return;
  console.debug('[VaultSTX timing]', label, ms + 'ms');
}

export function withTiming<T>(label: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    captureTiming(label, Math.round(performance.now() - start));
  }
}
FILEOF
commit "lib/telemetry.ts" "Add telemetry: opt-in performance and error telemetry helpers"

echo ""
echo "🎯 June 27 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
