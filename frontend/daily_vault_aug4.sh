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

# -- EscrowStats.tsx --
mkdir -p components/ui
cat > components/ui/EscrowStats.tsx << 'FILEOF'
import { microToSTX, type Escrow } from '@/lib/contract';

export function EscrowStats({ escrows }: { escrows: Escrow[] }) {
  const active   = escrows.filter(e => e.state === 'active').length;
  const disputed = escrows.filter(e => e.state === 'disputed').length;
  const locked   = escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      {[
        { label: 'Total',    value: escrows.length },
        { label: 'Active',   value: active,   color: '#1D9E75' },
        { label: 'Disputed', value: disputed, color: '#A32D2D' },
        { label: 'Locked',   value: microToSTX(locked) + ' STX', color: 'var(--gold)' },
      ].map(({ label, value, color = 'var(--text)' }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/EscrowStats.tsx" "Add EscrowStats: horizontal stats bar for escrow list header"

# -- useEscrowStatsAug.ts --
mkdir -p hooks
cat > hooks/useEscrowStatsAug.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';

export function useEscrowStatsAug(escrows: Escrow[]) {
  return useMemo(() => ({
    total:     escrows.length,
    open:      escrows.filter(e => e.state === 'open').length,
    active:    escrows.filter(e => e.state === 'active').length,
    disputed:  escrows.filter(e => e.state === 'disputed').length,
    complete:  escrows.filter(e => e.state === 'complete').length,
    cancelled: escrows.filter(e => e.state === 'cancelled').length,
    locked:    escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n),
    released:  escrows.reduce((a, e) => a + e.released, 0n),
  }), [escrows]);
}
FILEOF
commit "hooks/useEscrowStatsAug.ts" "Add useEscrowStatsAug: reactive statistics derived from escrow list"

# -- stats.ts --
mkdir -p lib
cat > lib/stats.ts << 'FILEOF'
import type { Escrow } from './contract';

export function totalLocked(escrows: Escrow[]): bigint {
  return escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n);
}

export function totalReleased(escrows: Escrow[]): bigint {
  return escrows.reduce((a, e) => a + e.released, 0n);
}

export function averageAmount(escrows: Escrow[]): bigint {
  if (escrows.length === 0) return 0n;
  return escrows.reduce((a, e) => a + e.totalAmount, 0n) / BigInt(escrows.length);
}

export function disputeRate(escrows: Escrow[]): number {
  if (escrows.length === 0) return 0;
  return escrows.filter(e => e.state === 'disputed').length / escrows.length;
}
FILEOF
commit "lib/stats.ts" "Add stats: statistical aggregation functions for escrow data"

echo ""
echo "🎯 August 4 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
