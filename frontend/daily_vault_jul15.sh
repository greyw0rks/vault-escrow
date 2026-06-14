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

# ── EscrowCreateSuccess.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowCreateSuccess.tsx << 'FILEOF'
'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRecentEscrows } from '@/hooks/useRecentEscrows';

interface Props { escrowId: number; onDone?: () => void; }

export function EscrowCreateSuccess({ escrowId, onDone }: Props) {
  const { add } = useRecentEscrows();
  useEffect(() => { add(escrowId); }, [escrowId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', lineHeight: 1 }}>✓</div>
      <div>
        <h2 style={{ margin: '0 0 .5rem', fontFamily: "'Playfair Display',serif" }}>Escrow #{escrowId} created!</h2>
        <p style={{ margin: 0, color: 'var(--muted)', fontFamily: "'DM Sans',sans-serif" }}>
          Your escrow is live on the Stacks blockchain.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '.75rem' }}>
        <Link href={'/escrow/' + escrowId} className="btn-primary">View Escrow</Link>
        <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/EscrowCreateSuccess.tsx" "Add EscrowCreateSuccess: success screen after escrow creation"

# ── useEscrowComplete.ts ──
mkdir -p hooks
cat > hooks/useEscrowComplete.ts << 'FILEOF'
'use client';
import { useEffect, useRef } from 'react';
import type { Escrow } from '@/lib/contract';

export function useEscrowComplete(escrow: Escrow | null, onComplete?: (e: Escrow) => void) {
  const prevState = useRef<string | null>(null);

  useEffect(() => {
    if (!escrow) return;
    if (prevState.current !== null && prevState.current !== 'complete' && escrow.state === 'complete') {
      onComplete?.(escrow);
    }
    prevState.current = escrow.state;
  }, [escrow?.state]);
}
FILEOF
commit "hooks/useEscrowComplete.ts" "Add useEscrowComplete: detect and handle escrow completion"

# ── export.ts ──
mkdir -p lib
cat > lib/export.ts << 'FILEOF'
import type { Escrow, Milestone } from './contract';
import { microToSTX } from './contract';

export interface EscrowReport {
  escrow: Escrow;
  milestones: Milestone[];
}

export function reportToJSON(report: EscrowReport): string {
  return JSON.stringify({
    id: report.escrow.id,
    state: report.escrow.state,
    totalSTX: microToSTX(report.escrow.totalAmount),
    releasedSTX: microToSTX(report.escrow.released),
    milestones: report.milestones.map((m, i) => ({
      index: i + 1,
      description: m.description,
      amountSTX: microToSTX(m.amount),
      state: m.state,
    })),
  }, null, 2);
}

export function downloadJSON(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
FILEOF
commit "lib/export.ts" "Add export: data export helpers for escrow reports"

echo ""
echo "🎯 July 15 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
