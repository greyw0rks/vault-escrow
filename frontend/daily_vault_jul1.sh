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

# ── PageContainer.tsx ──
mkdir -p components/ui
cat > components/ui/PageContainer.tsx << 'FILEOF'
interface Props { children: React.ReactNode; maxWidth?: number; }

export function PageContainer({ children, maxWidth = 900 }: Props) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' as const }}>
      {children}
    </div>
  );
}
FILEOF
commit "components/ui/PageContainer.tsx" "Add PageContainer: consistent max-width page wrapper"

# ── usePageTitle.ts ──
mkdir -p hooks
cat > hooks/usePageTitle.ts << 'FILEOF'
'use client';
import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title + ' · VaultSTX';
    return () => { document.title = prev; };
  }, [title]);
}
FILEOF
commit "hooks/usePageTitle.ts" "Add usePageTitle: set document title dynamically"

# ── codec.ts ──
mkdir -p lib
cat > lib/codec.ts << 'FILEOF'
export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export function fromBase64(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  return new Uint8Array(clean.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
}
FILEOF
commit "lib/codec.ts" "Add codec: base64 and hex encode/decode utilities"

echo ""
echo "🎯 July 1 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
