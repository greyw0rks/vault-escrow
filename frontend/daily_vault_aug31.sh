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

# -- Roadmap.tsx --
mkdir -p components/ui
cat > components/ui/Roadmap.tsx << 'FILEOF'
import { SEPTEMBER_ROADMAP } from '@/lib/roadmap';

export function Roadmap() {
  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", margin: '0 0 1rem' }}>September Roadmap</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {SEPTEMBER_ROADMAP.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.625rem .875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', width: 20, flexShrink: 0 }}>{item.id.toString().padStart(2, '0')}</span>
            <span style={{ fontSize: '.875rem', flex: 1 }}>{item.title}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.625rem', color: '#7C6AF7', background: '#7C6AF715', border: '1px solid #7C6AF733', borderRadius: 3, padding: '.1rem .35rem' }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/Roadmap.tsx" "Add Roadmap: display September development roadmap"

# -- useRoadmap.ts --
mkdir -p hooks
cat > hooks/useRoadmap.ts << 'FILEOF'
import { useMemo } from 'react';
import { SEPTEMBER_ROADMAP } from '@/lib/roadmap';

export function useRoadmap() {
  return useMemo(() => {
    const total    = SEPTEMBER_ROADMAP.length;
    const done     = SEPTEMBER_ROADMAP.filter(i => i.status === 'done').length;
    const inProg   = SEPTEMBER_ROADMAP.filter(i => i.status === 'in-progress').length;
    const planned  = SEPTEMBER_ROADMAP.filter(i => i.status === 'planned').length;
    return { items: SEPTEMBER_ROADMAP, total, done, inProg, planned, pct: Math.round(done / total * 100) };
  }, []);
}
FILEOF
commit "hooks/useRoadmap.ts" "Add useRoadmap: roadmap data and progress tracking hook"

# -- SEPTEMBER_PLAN.md --
mkdir -p lib
cat > lib/SEPTEMBER_PLAN.md << 'FILEOF'
# September 2026 Development Plan

## Goals
Complete VaultSTX v0.1.0 and prepare for mainnet launch.

## Week 1: Testing
- Set up Playwright for E2E testing
- Write tests for escrow creation flow
- Write tests for milestone approval flow
- Write tests for dispute resolution flow
- Smart contract integration test suite

## Week 2: Performance
- Analyze bundle with `next build --debug`
- Code-split heavy components
- Lazy load escrow detail sections
- Optimize re-renders with React.memo
- Add loading priority to above-fold content

## Week 3: Mobile & Accessibility
- Full mobile viewport audit
- Fix touch targets under 44px
- WCAG 2.1 AA compliance check
- Screen reader testing
- RTL layout support preparation

## Week 4: Launch Prep
- Mainnet deployment checklist
- Environment variable audit
- Error monitoring setup
- Documentation site (docs.vaultstx.xyz)
- npm package v0.1.1 release

## Stretch Goals
- Escrow templates for common use cases
- CSV bulk milestone import
- Dark/light theme toggle
- Email notifications via API
FILEOF
commit "lib/SEPTEMBER_PLAN.md" "Add SEPTEMBER_PLAN: detailed September development planning document"

echo ""
echo "🎯 August 31 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
