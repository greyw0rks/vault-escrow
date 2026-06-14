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

# ── KeyboardShortcutHint.tsx ──
mkdir -p components/ui
cat > components/ui/KeyboardShortcutHint.tsx << 'FILEOF'
interface Props { keys: string[]; label?: string; }

export function KeyboardShortcutHint({ keys, label }: Props) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
      {label && <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginRight: '.25rem' }}>{label}</span>}
      {keys.map(k => (
        <kbd key={k} style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
          background: 'var(--raised)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '.125rem .375rem',
          color: 'var(--muted)', lineHeight: 1.5,
        }}>{k}</kbd>
      ))}
    </span>
  );
}
FILEOF
commit "components/ui/KeyboardShortcutHint.tsx" "Add KeyboardShortcutHint: display keyboard shortcut badge"

# ── useHover.ts ──
mkdir -p hooks
cat > hooks/useHover.ts << 'FILEOF'
'use client';
import { useState, useRef, useCallback } from 'react';

export function useHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [hovered, setHovered] = useState(false);
  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);
  return { ref, hovered, onMouseEnter, onMouseLeave };
}
FILEOF
commit "hooks/useHover.ts" "Add useHover: detect mouse hover state on an element"

# ── queue.ts ──
mkdir -p lib
cat > lib/queue.ts << 'FILEOF'
type Task = () => Promise<void>;

export class AsyncQueue {
  private queue: Task[] = [];
  private running = false;

  enqueue(task: Task): void {
    this.queue.push(task);
    if (!this.running) this.drain();
  }

  private async drain(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try { await task(); } catch (e) { console.error('[VaultSTX queue]', e); }
    }
    this.running = false;
  }

  get size(): number { return this.queue.length; }
  get busy(): boolean { return this.running; }
}

export const contractQueue = new AsyncQueue();
FILEOF
commit "lib/queue.ts" "Add queue: async task queue for sequential contract calls"

echo ""
echo "🎯 June 22 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
