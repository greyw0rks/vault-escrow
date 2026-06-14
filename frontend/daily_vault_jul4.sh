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

# ── CodeBlock.tsx ──
mkdir -p components/ui
cat > components/ui/CodeBlock.tsx << 'FILEOF'
'use client';
import { useClipboard } from '@/hooks/useClipboard';

interface Props { code: string; language?: string; }

export function CodeBlock({ code, language }: Props) {
  const { copy, copied } = useClipboard();
  return (
    <div style={{ position: 'relative', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {language && (
        <div style={{ padding: '.375rem .75rem', borderBottom: '1px solid var(--border)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {language}
        </div>
      )}
      <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', lineHeight: 1.6 }}>
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copy(code)}
        style={{ position: 'absolute', top: language ? '2.5rem' : '.5rem', right: '.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '.25rem .5rem', cursor: 'pointer', color: copied ? '#1D9E75' : 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem' }}>
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}
FILEOF
commit "components/ui/CodeBlock.tsx" "Add CodeBlock: monospace code display with copy button"

# ── useScrollPosition.ts ──
mkdir -p hooks
cat > hooks/useScrollPosition.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = () => setPos({ x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return pos;
}
FILEOF
commit "hooks/useScrollPosition.ts" "Add useScrollPosition: track window scroll position"

# ── color.ts ──
mkdir -p lib
cat > lib/color.ts << 'FILEOF'
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
}

export function contrastColor(hex: string): '#1A1000' | '#F5F0E8' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#F5F0E8';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#1A1000' : '#F5F0E8';
}
FILEOF
commit "lib/color.ts" "Add color: color manipulation helpers for dynamic theming"

echo ""
echo "🎯 July 4 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
