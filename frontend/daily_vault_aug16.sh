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

# -- NavBrand.tsx --
mkdir -p components/ui
cat > components/ui/NavBrand.tsx << 'FILEOF'
import Link from 'next/link';

export function NavBrand() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.625rem', textDecoration: 'none' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#1A1000', fontWeight: 700, flexShrink: 0 }}>V</div>
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.125rem', color: 'var(--text)', fontWeight: 600 }}>VaultSTX</span>
    </Link>
  );
}
FILEOF
commit "components/ui/NavBrand.tsx" "Add NavBrand: VaultSTX brand logo and name for navigation"

# -- useNavBrand.ts --
mkdir -p hooks
cat > hooks/useNavBrand.ts << 'FILEOF'
'use client';
import { usePathname } from 'next/navigation';

export function useNavBrand() {
  const pathname = usePathname();
  return {
    pathname,
    isRoot: pathname === '/',
    showBack: pathname !== '/' && !pathname.startsWith('/dashboard'),
  };
}
FILEOF
commit "hooks/useNavBrand.ts" "Add useNavBrand: nav brand config and active route detection"

# -- brand.ts --
mkdir -p lib
cat > lib/brand.ts << 'FILEOF'
export const BRAND = {
  name:        'VaultSTX',
  tagline:     'Trustless milestone escrow on Stacks',
  url:         'https://vaultstx.xyz',
  github:      'https://github.com/greyw0rks/vault-escrow',
  icon:        '/logo.svg',
  og_image:    '/og-image.png',
} as const;

export const BRAND_COLORS = {
  primary: '#EF9F27',
  dark:    '#1A1000',
  cream:   '#F5F0E8',
  bg:      '#0D0A06',
} as const;
FILEOF
commit "lib/brand.ts" "Add brand: VaultSTX brand constants and color tokens"

echo ""
echo "🎯 August 16 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
