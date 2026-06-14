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

# ── IconButton.tsx ──
mkdir -p components/ui
cat > components/ui/IconButton.tsx << 'FILEOF'
'use client';
import { Tooltip } from './Tooltip';

interface Props {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

export function IconButton({ icon, label, onClick, disabled, size = 32 }: Props) {
  return (
    <Tooltip content={label}>
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        style={{
          width: size, height: size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? 'var(--muted)' : 'var(--text)',
          fontSize: size * 0.45 + 'px', transition: 'border-color .15s',
          opacity: disabled ? .5 : 1,
        }}>
        {icon}
      </button>
    </Tooltip>
  );
}
FILEOF
commit "components/ui/IconButton.tsx" "Add IconButton: accessible icon-only button with tooltip"

# ── useQueryParam.ts ──
mkdir -p hooks
cat > hooks/useQueryParam.ts << 'FILEOF'
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParam(key: string) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = params.get(key) ?? '';

  const setValue = useCallback((val: string) => {
    const p = new URLSearchParams(params.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(pathname + (p.toString() ? '?' + p.toString() : ''));
  }, [key, params, router, pathname]);

  return [value, setValue] as const;
}
FILEOF
commit "hooks/useQueryParam.ts" "Add useQueryParam: read and set a single URL query parameter"

# ── pipe.ts ──
mkdir -p lib
cat > lib/pipe.ts << 'FILEOF'
export function pipe<T>(...fns: ((v: T) => T)[]): (v: T) => T {
  return (v: T) => fns.reduce((acc, fn) => fn(acc), v);
}

export function compose<T>(...fns: ((v: T) => T)[]): (v: T) => T {
  return pipe(...fns.reverse());
}

export function identity<T>(v: T): T { return v; }

export function constant<T>(v: T): () => T { return () => v; }
FILEOF
commit "lib/pipe.ts" "Add pipe: functional pipe and compose utilities"

echo ""
echo "🎯 July 2 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
