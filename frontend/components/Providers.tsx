'use client';
import dynamic from 'next/dynamic';

// Nav reads wallet state, so it only renders on the client.
const Nav = dynamic(() => import('./Nav'), { ssr: false });

/**
 * The legacy <Connect> wrapper is gone: @stacks/connect 8 exposes
 * connect()/request() directly, so there is no provider to mount and no
 * UserSession to keep in sync.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
