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

# -- AccessibleModal.tsx --
mkdir -p components/ui
cat > components/ui/AccessibleModal.tsx << 'FILEOF'
'use client';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyPress } from '@/hooks/useKeyPress';
import { ariaLabel } from '@/lib/accessibility';

interface Props { open: boolean; title: string; onClose: () => void; children: React.ReactNode; width?: number; }

export function AccessibleModal({ open, title, onClose, children, width = 480 }: Props) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useKeyPress('Escape', onClose);
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" {...ariaLabel(title)} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} onClick={onClose} />
      <div ref={trapRef} style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: '90%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.25rem' }}>{title}</h2>
          <button onClick={onClose} {...ariaLabel('Close')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem', lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/AccessibleModal.tsx" "Add AccessibleModal: fully accessible modal dialog component"

# -- usePrefersReducedMotion.ts --
mkdir -p hooks
cat > hooks/usePrefersReducedMotion.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    mq.addEventListener('change', e => setReduced(e.matches));
  }, []);
  return reduced;
}
FILEOF
commit "hooks/usePrefersReducedMotion.ts" "Add usePrefersReducedMotion: detect user motion preferences"

# -- motion.ts --
mkdir -p lib
cat > lib/motion.ts << 'FILEOF'
export function motionSafe(animation: string, fallback = 'none'): string {
  if (typeof window === 'undefined') return fallback;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? fallback : animation;
}

export function transition(duration = 200, easing = 'ease'): string {
  return motionSafe('all ' + duration + 'ms ' + easing);
}
FILEOF
commit "lib/motion.ts" "Add motion: motion-safe animation helpers respecting user preferences"

echo ""
echo "🎯 August 11 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
