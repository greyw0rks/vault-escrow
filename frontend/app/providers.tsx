'use client';

import { Connect } from '@stacks/connect-react';
import { userSession } from './lib/userSession';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Connect
      authOptions={{
        appDetails: { name: 'VaultSTX', icon: '/favicon.ico' },
        userSession,
      }}
    >
      {children}
    </Connect>
  );
}
