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

# ── BackLink.tsx ──
mkdir -p components/ui
cat > components/ui/BackLink.tsx << 'FILEOF'
'use client';
import Link from 'next/link';

interface Props { href: string; label?: string; }

export function BackLink({ href, label = 'Back' }: Props) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: '.375rem',
      color: 'var(--muted)', textDecoration: 'none',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem',
      marginBottom: '1.5rem', transition: 'color .15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
      ← {label}
    </Link>
  );
}
FILEOF
commit "components/ui/BackLink.tsx" "Add BackLink: styled back navigation link"

# ── useContractRead.ts ──
mkdir -p hooks
cat > hooks/useContractRead.ts << 'FILEOF'
'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/contract';

export function useContractRead(functionName: string, functionArgs: any[] = []) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      });
      setData(cvToValue(result));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [functionName]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}
FILEOF
commit "hooks/useContractRead.ts" "Add useContractRead: generic read-only contract function caller"

# ── markdown.ts ──
mkdir -p lib
cat > lib/markdown.ts << 'FILEOF'
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .trim();
}

export function excerpt(text: string, max = 100): string {
  const stripped = stripMarkdown(text);
  return stripped.length <= max ? stripped : stripped.slice(0, max).trimEnd() + '…';
}
FILEOF
commit "lib/markdown.ts" "Add markdown: minimal markdown-to-text stripper for descriptions"

echo ""
echo "🎯 June 17 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
