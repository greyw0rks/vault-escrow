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

# -- MobileDrawer.tsx --
mkdir -p components/ui
cat > components/ui/MobileDrawer.tsx << 'FILEOF'
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props { open: boolean; onClose: () => void; }

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: 'o' },
  { href: '/dashboard',  label: 'Dashboard',  icon: '#' },
  { href: '/escrow/new', label: 'New Escrow', icon: '+' },
];

export function MobileDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }} onClick={onClose} />}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, background: 'var(--surface)', borderRight: '1px solid var(--border)', zIndex: 201, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .25s ease', padding: '1.5rem 1rem' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold)' }}>VaultSTX</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: pathname === item.href ? 'var(--gold)' : 'var(--text)', background: pathname === item.href ? 'rgba(239,159,39,.08)' : 'none', fontFamily: "'DM Sans',sans-serif" }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
FILEOF
commit "components/ui/MobileDrawer.tsx" "Add MobileDrawer: slide-in drawer for mobile navigation"

# -- useMobileMenu.ts --
mkdir -p hooks
cat > hooks/useMobileMenu.ts << 'FILEOF'
'use client';
import { useToggle } from './useToggle';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useMobileMenu() {
  const [open, toggle, , close] = useToggle(false);
  const pathname = usePathname();
  useEffect(() => close(), [pathname]);
  return { open, toggle, close };
}
FILEOF
commit "hooks/useMobileMenu.ts" "Add useMobileMenu: manage mobile navigation drawer state"

# -- accessibility.ts --
mkdir -p lib
cat > lib/accessibility.ts << 'FILEOF'
export function ariaLabel(label: string): { 'aria-label': string } {
  return { 'aria-label': label };
}

export function ariaExpanded(expanded: boolean): { 'aria-expanded': boolean } {
  return { 'aria-expanded': expanded };
}

export function ariaHidden(hidden = true): { 'aria-hidden': boolean } {
  return { 'aria-hidden': hidden };
}

export function srOnly(): React.CSSProperties {
  return { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
}
FILEOF
commit "lib/accessibility.ts" "Add accessibility: ARIA helper utilities for accessible components"

echo ""
echo "🎯 August 9 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
