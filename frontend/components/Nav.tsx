'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { APP_NAME } from '@/lib/config';
import { NETWORK_NAME } from '@/lib/contract';
import { trunc } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { Button } from './ui/button';

const LINKS = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/escrow/new', label: 'NEW ESCROW' },
  { href: '/disputes', label: 'DISPUTES' },
  { href: '/registry', label: 'REGISTRY' },
];

export function Nav() {
  const { connected, address, connect, disconnect } = useApp();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[1400px] items-stretch">
        <Link
          href="/"
          className="flex items-center gap-2 border-r-2 border-line px-5 macro text-xl hover:bg-fg hover:text-bg"
        >
          {APP_NAME}<span className="text-hazard">®</span>
        </Link>

        <nav className="flex items-stretch">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'hidden items-center border-r-2 border-line px-4 font-mono text-[0.7rem] font-bold uppercase tracking-widest md:flex',
                  active ? 'bg-fg text-bg' : 'text-fg-2 hover:bg-panel-2 hover:text-fg',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 px-4">
          <span className="hidden items-center gap-1.5 border-2 border-line px-2 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-fg-2 sm:inline-flex">
            <span className={cn('h-2 w-2', NETWORK_NAME === 'mainnet' ? 'bg-hazard' : 'bg-fg', 'blink')} />
            {NETWORK_NAME}
          </span>
          {connected && address ? (
            <button
              onClick={disconnect}
              className="border-2 border-line bg-panel px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest text-fg hover:bg-hazard hover:border-hazard"
              title="Disconnect"
            >
              {trunc(address, 5)}
            </button>
          ) : (
            <Button size="sm" onClick={connect}>CONNECT</Button>
          )}
        </div>
      </div>
    </header>
  );
}
