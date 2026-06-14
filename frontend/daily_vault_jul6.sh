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

# ── FloatingActionButton.tsx ──
mkdir -p components/ui
cat > components/ui/FloatingActionButton.tsx << 'FILEOF'
'use client';
import Link from 'next/link';

interface Props { href: string; label: string; icon?: string; }

export function FloatingActionButton({ href, label, icon = '+' }: Props) {
  return (
    <Link href={href} style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      display: 'flex', alignItems: 'center', gap: '.5rem',
      background: 'var(--gold)', color: '#1A1000',
      borderRadius: 28, padding: '.75rem 1.25rem',
      fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.9rem',
      textDecoration: 'none', boxShadow: '0 4px 20px rgba(239,159,39,.4)',
      transition: 'transform .15s, box-shadow .15s',
      zIndex: 100,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(239,159,39,.5)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,159,39,.4)'; }}>
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
      {label}
    </Link>
  );
}
FILEOF
commit "components/ui/FloatingActionButton.tsx" "Add FloatingActionButton: fixed position primary action button"

# ── useIntersectionObserver.ts ──
mkdir -p hooks
cat > hooks/useIntersectionObserver.ts << 'FILEOF'
'use client';
import { useEffect, useRef, useState } from 'react';

interface Options { threshold?: number; rootMargin?: string; }

export function useIntersectionObserver<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: options.threshold ?? 0, rootMargin: options.rootMargin ?? '0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref, visible };
}
FILEOF
commit "hooks/useIntersectionObserver.ts" "Add useIntersectionObserver: detect element visibility in viewport"

# ── generate-id.ts ──
mkdir -p lib
cat > lib/generate-id.ts << 'FILEOF'
export function nanoid(size = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const byte of bytes) result += chars[byte % chars.length];
  return result;
}

export function shortId(): string { return nanoid(8); }

export function prefixedId(prefix: string): string {
  return prefix + '_' + nanoid(10);
}
FILEOF
commit "lib/generate-id.ts" "Add generate-id: client-side unique ID generation helpers"

echo ""
echo "🎯 July 6 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
