'use client';
import { Connect } from '@stacks/connect-react';
import dynamic from 'next/dynamic';

const Nav = dynamic(() => import('./Nav'), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Connect authOptions={{ appDetails: { name: 'VaultSTX', icon: '/logo.svg' } }}>
      <Nav />
      {children}
    </Connect>
  );
}
