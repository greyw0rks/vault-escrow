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

# ── EscrowTimeline.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowTimeline.tsx << 'FILEOF'
import type { TimelineEvent } from '@/hooks/useEscrowTimeline';

const COLORS: Record<TimelineEvent['type'], string> = {
  created:  'var(--gold)',
  submitted: '#EF9F27',
  approved:  '#1D9E75',
  disputed:  '#A32D2D',
  resolved:  '#7C6AF7',
};

const ICONS: Record<TimelineEvent['type'], string> = {
  created: '⬡', submitted: '📤', approved: '✓', disputed: '⚠', resolved: '⚖',
};

export function EscrowTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((ev, i) => {
        const color = COLORS[ev.type];
        return (
          <div key={i} style={{ display: 'flex', gap: '.875rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: color + '22', border: '1px solid ' + color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', color }}>
                {ICONS[ev.type]}
              </div>
              {i < events.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '3px 0', minHeight: 20 }} />}
            </div>
            <div style={{ paddingBottom: i < events.length - 1 ? '.875rem' : 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '.875rem' }}>{ev.label}</p>
              <p style={{ margin: '.2rem 0 0', fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>Block #{ev.block.toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
FILEOF
commit "components/ui/EscrowTimeline.tsx" "Add EscrowTimeline: visual timeline of escrow lifecycle events"

# ── useAnimatedValue.ts ──
mkdir -p hooks
cat > hooks/useAnimatedValue.ts << 'FILEOF'
'use client';
import { useState, useEffect, useRef } from 'react';

export function useAnimatedValue(target: number, duration = 600): number {
  const [current, setCurrent] = useState(target);
  const start = useRef({ value: target, time: 0 });

  useEffect(() => {
    start.current = { value: current, time: performance.now() };
    let frame: number;
    const animate = (now: number) => {
      const elapsed = now - start.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start.current.value + (target - start.current.value) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return current;
}
FILEOF
commit "hooks/useAnimatedValue.ts" "Add useAnimatedValue: animate numeric value changes smoothly"

# ── animation.ts ──
mkdir -p lib
cat > lib/animation.ts << 'FILEOF'
export const TRANSITIONS = {
  fast:   'all .1s ease',
  normal: 'all .2s ease',
  slow:   'all .4s ease',
} as const;

export const EASING = {
  ease:        'cubic-bezier(.25,.1,.25,1)',
  easeIn:      'cubic-bezier(.42,0,1,1)',
  easeOut:     'cubic-bezier(0,0,.58,1)',
  easeInOut:   'cubic-bezier(.42,0,.58,1)',
  spring:      'cubic-bezier(.34,1.56,.64,1)',
} as const;

export function fadeIn(ms = 200): React.CSSProperties {
  return { animation: 'fadeIn ' + ms + 'ms ' + EASING.easeOut + ' both' };
}

export const KEYFRAMES = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes slideIn { from { transform: translateX(-8px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
`;
FILEOF
commit "lib/animation.ts" "Add animation: CSS animation keyframe and transition helpers"

echo ""
echo "🎯 July 8 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
