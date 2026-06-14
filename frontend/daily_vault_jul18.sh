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

# ── EscrowGrid.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowGrid.tsx << 'FILEOF'
'use client';
import { EscrowCard } from './EscrowCard';
import { EscrowCardSkeleton } from './Skeleton';
import { EmptyEscrows } from './EmptyEscrows';
import type { Escrow } from '@/lib/contract';

interface Props { escrows: Escrow[]; address?: string | null; loading?: boolean; filtered?: boolean; }

export function EscrowGrid({ escrows, address, loading, filtered }: Props) {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {[1, 2, 3].map(i => <EscrowCardSkeleton key={i} />)}
    </div>
  );
  if (escrows.length === 0) return <EmptyEscrows filtered={filtered} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {escrows.map(e => <EscrowCard key={e.id} escrow={e} address={address} />)}
    </div>
  );
}
FILEOF
commit "components/ui/EscrowGrid.tsx" "Add EscrowGrid: responsive grid of escrow cards"

# ── useEscrowHistory.ts ──
mkdir -p hooks
cat > hooks/useEscrowHistory.ts << 'FILEOF'
'use client';
import { useEffect } from 'react';
import { useRecentEscrows } from './useRecentEscrows';

export function useEscrowHistory(escrowId: number | null) {
  const { add } = useRecentEscrows();
  useEffect(() => {
    if (escrowId) add(escrowId);
  }, [escrowId]);
}
FILEOF
commit "hooks/useEscrowHistory.ts" "Add useEscrowHistory: track navigation history between escrows"

# ── i18n.ts ──
mkdir -p lib
cat > lib/i18n.ts << 'FILEOF'
const STRINGS = {
  'escrow.state.open':      'Open',
  'escrow.state.active':    'Active',
  'escrow.state.disputed':  'Disputed',
  'escrow.state.complete':  'Complete',
  'escrow.state.cancelled': 'Cancelled',
  'milestone.state.pending':   'Pending',
  'milestone.state.submitted': 'Submitted',
  'milestone.state.approved':  'Approved',
  'milestone.state.disputed':  'Disputed',
  'role.client':   'Client',
  'role.worker':   'Worker',
  'role.resolver': 'Resolver',
  'role.observer': 'Observer',
} as const;

type Key = keyof typeof STRINGS;

export function t(key: Key): string {
  return STRINGS[key] ?? key;
}
FILEOF
commit "lib/i18n.ts" "Add i18n: minimal internationalization helpers for UI strings"

echo ""
echo "🎯 July 18 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
