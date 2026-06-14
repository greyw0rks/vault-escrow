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

# ── ParticipantsSection.tsx ──
mkdir -p components/ui
cat > components/ui/ParticipantsSection.tsx << 'FILEOF'
import { ParticipantCard } from './ParticipantCard';
import { SectionHeader } from './SectionHeader';
import { useEscrowParticipants } from '@/hooks/useEscrowParticipants';
import type { Escrow } from '@/lib/contract';

interface Props { escrow: Escrow; myAddress: string | null; }

export function ParticipantsSection({ escrow, myAddress }: Props) {
  const participants = useEscrowParticipants(escrow, myAddress);
  return (
    <div>
      <SectionHeader title="Participants" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.75rem' }}>
        {participants.map(p => (
          <ParticipantCard key={p.role} address={p.address} role={p.role} isYou={p.isYou} />
        ))}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/ParticipantsSection.tsx" "Add ParticipantsSection: escrow participants grid with cards"

# ── useNetworkStatus.ts ──
mkdir -p hooks
cat > hooks/useNetworkStatus.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return { online, offline: !online };
}
FILEOF
commit "hooks/useNetworkStatus.ts" "Add useNetworkStatus: detect online/offline network status"

# ── constants2.ts ──
mkdir -p lib
cat > lib/constants2.ts << 'FILEOF'
export const MAX_MILESTONES     = 10;
export const MIN_DEPOSIT_STX    = 1;
export const MAX_DEPOSIT_STX    = 1_000_000;
export const MAX_DESCRIPTION_LEN = 256;
export const MIN_DESCRIPTION_LEN = 3;
export const SCAN_BATCH_SIZE    = 10;
export const POLL_INTERVAL_MS   = 15_000;
export const TX_TIMEOUT_MS      = 300_000;
export const CACHE_TTL_MS       = 30_000;
FILEOF
commit "lib/constants2.ts" "Add constants2: milestone and escrow limit constants"

echo ""
echo "🎯 June 28 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
