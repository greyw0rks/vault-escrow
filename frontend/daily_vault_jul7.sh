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

# ── LazyImage.tsx ──
mkdir -p components/ui
cat > components/ui/LazyImage.tsx << 'FILEOF'
'use client';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useState } from 'react';

interface Props { src: string; alt: string; width?: number; height?: number; style?: React.CSSProperties; }

export function LazyImage({ src, alt, width, height, style }: Props) {
  const { ref, visible } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={ref} style={{ width, height, background: 'var(--raised)', borderRadius: 4, overflow: 'hidden', ...style }}>
      {visible && (
        <img
          src={src} alt={alt} width={width} height={height}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity .3s', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
FILEOF
commit "components/ui/LazyImage.tsx" "Add LazyImage: lazy-loaded image with blur placeholder"

# ── useEscrowTimeline.ts ──
mkdir -p hooks
cat > hooks/useEscrowTimeline.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';

export interface TimelineEvent {
  type: 'created' | 'submitted' | 'approved' | 'disputed' | 'resolved';
  block: number;
  label: string;
}

export function useEscrowTimeline(escrow: Escrow | null, milestones: Milestone[]): TimelineEvent[] {
  return useMemo(() => {
    if (!escrow) return [];
    const events: TimelineEvent[] = [
      { type: 'created', block: escrow.createdAt, label: 'Escrow created' },
    ];
    milestones.forEach((ms, i) => {
      if (ms.blockSubmitted > 0) events.push({ type: 'submitted', block: ms.blockSubmitted, label: 'Milestone ' + (i + 1) + ' submitted' });
      if (ms.blockResolved > 0 && ms.state === 'approved') events.push({ type: 'approved', block: ms.blockResolved, label: 'Milestone ' + (i + 1) + ' approved' });
      if (ms.blockResolved > 0 && ms.state === 'disputed') events.push({ type: 'disputed', block: ms.blockResolved, label: 'Milestone ' + (i + 1) + ' disputed' });
    });
    return events.sort((a, b) => a.block - b.block);
  }, [escrow, milestones]);
}
FILEOF
commit "hooks/useEscrowTimeline.ts" "Add useEscrowTimeline: build chronological timeline from escrow data"

# ── worker.ts ──
mkdir -p lib
cat > lib/worker.ts << 'FILEOF'
export function runInWorker<T>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    const blob = new Blob(['self.onmessage = function(e) { try { self.postMessage({ ok: true, value: (' + fn.toString() + ')() }); } catch(e) { self.postMessage({ ok: false, error: e.message }); } }'], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.onmessage = (e) => {
      URL.revokeObjectURL(url);
      worker.terminate();
      if (e.data.ok) resolve(e.data.value);
      else reject(new Error(e.data.error));
    };
    worker.postMessage(null);
  });
}
FILEOF
commit "lib/worker.ts" "Add worker: Web Worker helpers for heavy computation off main thread"

echo ""
echo "🎯 July 7 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
