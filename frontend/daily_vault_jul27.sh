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

# ── ColorDot.tsx ──
mkdir -p components/ui
cat > components/ui/ColorDot.tsx << 'FILEOF'
interface Props { color: string; size?: number; pulse?: boolean; }

export function ColorDot({ color, size = 8, pulse }: Props) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {pulse && (
        <span style={{ position: 'absolute', width: size * 2, height: size * 2, borderRadius: '50%', background: color + '33', animation: 'pulse 2s infinite' }} />
      )}
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      <style>{'@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }'}</style>
    </span>
  );
}
FILEOF
commit "components/ui/ColorDot.tsx" "Add ColorDot: small colored status dot indicator"

# ── useMousePosition.ts ──
mkdir -p hooks
cat > hooks/useMousePosition.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);
  return pos;
}
FILEOF
commit "hooks/useMousePosition.ts" "Add useMousePosition: track global mouse cursor position"

# ── array.ts ──
mkdir -p lib
cat > lib/array.ts << 'FILEOF'
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    acc[k] = [...(acc[k] ?? []), item];
    return acc;
  }, {} as Record<string, T[]>);
}

export function unique<T>(items: T[], key?: (item: T) => unknown): T[] {
  if (!key) return [...new Set(items)];
  const seen = new Set();
  return items.filter(item => { const k = key(item); if (seen.has(k)) return false; seen.add(k); return true; });
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export function last<T>(items: T[]): T | undefined { return items[items.length - 1]; }
export function first<T>(items: T[]): T | undefined { return items[0]; }
FILEOF
commit "lib/array.ts" "Add array: typed array utility helpers for escrow data"

echo ""
echo "🎯 July 27 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
