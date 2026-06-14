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

# ── ExportReportButton.tsx ──
mkdir -p components/ui
cat > components/ui/ExportReportButton.tsx << 'FILEOF'
'use client';
import type { Escrow, Milestone } from '@/lib/contract';
import { reportToJSON, downloadJSON } from '@/lib/export';

interface Props { escrow: Escrow; milestones: Milestone[]; }

export function ExportReportButton({ escrow, milestones }: Props) {
  const handleExport = () => {
    const json = reportToJSON({ escrow, milestones });
    downloadJSON(json, 'escrow-' + escrow.id + '-report.json');
  };
  return (
    <button className="btn-ghost" onClick={handleExport} style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}>
      ↓ Export JSON
    </button>
  );
}
FILEOF
commit "components/ui/ExportReportButton.tsx" "Add ExportReportButton: download full escrow JSON report"

# ── useEscrowShare.ts ──
mkdir -p hooks
cat > hooks/useEscrowShare.ts << 'FILEOF'
'use client';
import { useClipboard } from './useClipboard';
import { escrowUrl } from '@/lib/url';

export function useEscrowShare(escrowId: number) {
  const { copy, copied } = useClipboard();
  const url = escrowUrl(escrowId);
  const share = () => copy(url);
  return { share, copied, url };
}
FILEOF
commit "hooks/useEscrowShare.ts" "Add useEscrowShare: generate and copy shareable escrow links"

# ── parse-cv.ts ──
mkdir -p lib
cat > lib/parse-cv.ts << 'FILEOF'
import { cvToValue } from '@stacks/transactions';

export function parseOptional<T>(cv: unknown, transform: (v: unknown) => T): T | null {
  const val = cvToValue(cv as any);
  if (val === null || val === undefined) return null;
  return transform(val);
}

export function parsePrincipalCV(cv: unknown): string | null {
  const val = cvToValue(cv as any);
  return typeof val === 'string' ? val : null;
}

export function parseUintCV(cv: unknown): bigint | null {
  const val = cvToValue(cv as any);
  return val !== null && val !== undefined ? BigInt(val) : null;
}

export function parseBoolCV(cv: unknown): boolean | null {
  const val = cvToValue(cv as any);
  return typeof val === 'boolean' ? val : null;
}
FILEOF
commit "lib/parse-cv.ts" "Add parse-cv: Clarity value parsing helpers for contract responses"

echo ""
echo "🎯 July 16 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
