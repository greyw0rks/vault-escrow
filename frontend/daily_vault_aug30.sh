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

# -- MonthComplete.tsx --
mkdir -p components/ui
cat > components/ui/MonthComplete.tsx << 'FILEOF'
interface Props { month: string; fileCount: number; }

export function MonthComplete({ month, fileCount }: Props) {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239,159,39,.1) 0%, rgba(29,158,117,.08) 100%)', border: '1px solid var(--gold-dim)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>✓</div>
      <h3 style={{ margin: '0 0 .5rem', fontFamily: "'Playfair Display',serif", color: 'var(--gold)' }}>{month} Complete</h3>
      <p style={{ margin: 0, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>
        {fileCount} files committed
      </p>
    </div>
  );
}
FILEOF
commit "components/ui/MonthComplete.tsx" "Add MonthComplete: celebration banner for completed month"

# -- useMonthStats.ts --
mkdir -p hooks
cat > hooks/useMonthStats.ts << 'FILEOF'
import { useMemo } from 'react';

interface MonthData { month: string; files: number; commits: number; }

const MONTHS: MonthData[] = [
  { month: 'May 2026',    files: 51,  commits: 112 },
  { month: 'June 2026',   files: 90,  commits: 90  },
  { month: 'July 2026',   files: 93,  commits: 93  },
  { month: 'August 2026', files: 90,  commits: 90  },
];

export function useMonthStats() {
  return useMemo(() => ({
    months:      MONTHS,
    totalFiles:  MONTHS.reduce((a, m) => a + m.files, 0),
    totalCommits: MONTHS.reduce((a, m) => a + m.commits, 0),
    currentMonth: MONTHS[MONTHS.length - 1],
  }), []);
}
FILEOF
commit "hooks/useMonthStats.ts" "Add useMonthStats: aggregate stats for completed development month"

# -- roadmap.ts --
mkdir -p lib
cat > lib/roadmap.ts << 'FILEOF'
export const SEPTEMBER_ROADMAP = [
  { id: 1, title: 'E2E test suite with Playwright',       status: 'planned' },
  { id: 2, title: 'Smart contract integration tests',     status: 'planned' },
  { id: 3, title: 'Bundle size optimization',             status: 'planned' },
  { id: 4, title: 'Mobile responsiveness audit',          status: 'planned' },
  { id: 5, title: 'Documentation site',                   status: 'planned' },
  { id: 6, title: 'Mainnet deployment',                   status: 'planned' },
  { id: 7, title: 'Multi-language support (i18n)',        status: 'planned' },
  { id: 8, title: 'Dark/light theme toggle',              status: 'planned' },
  { id: 9, title: 'Escrow templates',                     status: 'planned' },
  { id: 10, title: 'Bulk milestone import from CSV',      status: 'planned' },
] as const;

export type RoadmapStatus = 'planned' | 'in-progress' | 'done';
FILEOF
commit "lib/roadmap.ts" "Add roadmap: September roadmap and upcoming feature planning"

echo ""
echo "🎯 August 30 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
