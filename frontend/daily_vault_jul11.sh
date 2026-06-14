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

# ── StepWizard.tsx ──
mkdir -p components/ui
cat > components/ui/StepWizard.tsx << 'FILEOF'
'use client';
import { useState } from 'react';

interface Step { label: string; content: React.ReactNode; }
interface Props { steps: Step[]; onComplete: () => void; }

export function StepWizard({ steps, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const isLast = current === steps.length - 1;

  return (
    <div>
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i <= current ? 'var(--gold)' : 'var(--raised)', border: '1px solid ' + (i <= current ? 'var(--gold)' : 'var(--border)'), color: i <= current ? '#1A1000' : 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', flexShrink: 0, fontWeight: 600 }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '.8125rem', color: i === current ? 'var(--text)' : 'var(--muted)', display: 'none' }}>{step.label}</span>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i < current ? 'var(--gold)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontFamily: "'Playfair Display',serif" }}>{steps[current].label}</h3>
        {steps[current].content}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => setCurrent(c => c - 1)} disabled={current === 0} style={{ padding: '.5rem 1rem' }}>← Back</button>
        <button className="btn-primary" onClick={() => isLast ? onComplete() : setCurrent(c => c + 1)} style={{ padding: '.5rem 1.25rem' }}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/StepWizard.tsx" "Add StepWizard: multi-step form wizard container"

# ── useStepWizard.ts ──
mkdir -p hooks
cat > hooks/useStepWizard.ts << 'FILEOF'
import { useState, useCallback } from 'react';

export function useStepWizard(totalSteps: number) {
  const [step, setStep] = useState(0);
  const isFirst = step === 0;
  const isLast  = step === totalSteps - 1;

  const next = useCallback(() => setStep(s => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const go   = useCallback((s: number) => setStep(Math.max(0, Math.min(s, totalSteps - 1))), [totalSteps]);
  const reset = useCallback(() => setStep(0), []);

  return { step, next, prev, go, reset, isFirst, isLast, progress: Math.round((step / (totalSteps - 1)) * 100) };
}
FILEOF
commit "hooks/useStepWizard.ts" "Add useStepWizard: manage step wizard state and navigation"

# ── format-stx.ts ──
mkdir -p lib
cat > lib/format-stx.ts << 'FILEOF'
export function formatSTXFull(micro: bigint): string {
  const stx = Number(micro) / 1_000_000;
  return stx.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 }) + ' STX';
}

export function formatSTXCompact(micro: bigint): string {
  const stx = Number(micro) / 1_000_000;
  if (stx >= 1000) return (stx / 1000).toFixed(1) + 'K STX';
  return stx.toFixed(stx < 1 ? 4 : 2) + ' STX';
}

export function formatSTXUSD(micro: bigint, priceUSD: number): string {
  const stx = Number(micro) / 1_000_000;
  const usd = stx * priceUSD;
  return '\$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
FILEOF
commit "lib/format-stx.ts" "Add format-stx: comprehensive STX formatting for display contexts"

echo ""
echo "🎯 July 11 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
