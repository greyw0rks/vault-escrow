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

# -- KeyboardShortcuts.tsx --
mkdir -p components/ui
cat > components/ui/KeyboardShortcuts.tsx << 'FILEOF'
'use client';
import { useToggle } from '@/hooks/useToggle';
import { useKeyPress } from '@/hooks/useKeyPress';
import { KEYMAP, formatKey } from '@/lib/keymap';

const SHORTCUTS = [
  { key: KEYMAP.SEARCH,    desc: 'Focus search' },
  { key: KEYMAP.NEW_ESCROW,desc: 'New escrow' },
  { key: KEYMAP.DASHBOARD, desc: 'Go to dashboard' },
  { key: KEYMAP.REFRESH,   desc: 'Refresh data' },
  { key: KEYMAP.NEXT,      desc: 'Next item' },
  { key: KEYMAP.PREV,      desc: 'Previous item' },
  { key: '?',              desc: 'Show shortcuts' },
];

export function KeyboardShortcuts() {
  const [open, toggle, , close] = useToggle(false);
  useKeyPress('?', toggle);
  useKeyPress('Escape', close);
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={close}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', minWidth: 320 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem', fontFamily: "'Playfair Display',serif" }}>Keyboard Shortcuts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{desc}</span>
              <kbd style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 4, padding: '.125rem .5rem', color: 'var(--text)' }}>{formatKey(key)}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/KeyboardShortcuts.tsx" "Add KeyboardShortcuts: keyboard shortcut help overlay"

# -- useGlobalShortcuts.ts --
mkdir -p hooks
cat > hooks/useGlobalShortcuts.ts << 'FILEOF'
'use client';
import { useRouter } from 'next/navigation';
import { useKeyPress } from './useKeyPress';
import { KEYMAP } from '@/lib/keymap';

export function useGlobalShortcuts(onRefresh?: () => void) {
  const router = useRouter();
  useKeyPress(KEYMAP.NEW_ESCROW, () => router.push('/escrow/new'));
  useKeyPress(KEYMAP.DASHBOARD,  () => router.push('/dashboard'));
  useKeyPress(KEYMAP.REFRESH,    () => onRefresh?.());
  useKeyPress(KEYMAP.SEARCH, (e) => {
    e.preventDefault();
    document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
  });
}
FILEOF
commit "hooks/useGlobalShortcuts.ts" "Add useGlobalShortcuts: register app-wide keyboard shortcuts"

# -- perf.ts --
mkdir -p lib
cat > lib/perf.ts << 'FILEOF'
export class PerfTimer {
  private start: number;
  private marks: { label: string; ms: number }[] = [];

  constructor() { this.start = performance.now(); }

  mark(label: string) {
    this.marks.push({ label, ms: Math.round(performance.now() - this.start) });
  }

  report(): string {
    return this.marks.map(m => m.label + ': ' + m.ms + 'ms').join(', ');
  }

  total(): number {
    return Math.round(performance.now() - this.start);
  }
}

export function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t = performance.now();
  return fn().finally(() => {
    console.debug('[VaultSTX perf]', label, Math.round(performance.now() - t) + 'ms');
  });
}
FILEOF
commit "lib/perf.ts" "Add perf: performance measurement and reporting utilities"

echo ""
echo "🎯 August 7 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
